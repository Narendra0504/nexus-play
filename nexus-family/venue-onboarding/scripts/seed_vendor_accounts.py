#!/usr/bin/env python
# =============================================================================
# NEXUS FAMILY PASS - VENDOR ACCOUNT SEEDING SCRIPT
# =============================================================================
"""
Vendor Account Seeding Script.

This script creates vendor credentials for venues so they can
access the vendor portal. For Phase 1, this creates dummy
credentials that vendors can use to log in and view their
venue information.

Features:
    - Create vendor accounts for venues without credentials
    - Generate secure random passwords
    - Output credentials for distribution
    - Option to export credentials to CSV

Usage:
    # Seed accounts for all venues without credentials
    python scripts/seed_vendor_accounts.py
    
    # Seed for specific venue
    python scripts/seed_vendor_accounts.py --venue-id <uuid>
    
    # Export credentials to CSV
    python scripts/seed_vendor_accounts.py --export credentials.csv
    
    # Use specific password for testing
    python scripts/seed_vendor_accounts.py --default-password "TestPass123!"
    
    # Dry run
    python scripts/seed_vendor_accounts.py --dry-run

Environment Variables Required:
    - DATABASE_URL: PostgreSQL connection string

IMPORTANT:
    - Generated passwords should be securely distributed to vendors
    - Vendors should be encouraged to change passwords on first login
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import asyncio  # Async operations
import argparse  # Command line argument parsing
import csv  # CSV file handling
import secrets  # Secure random generation
import string  # String utilities
import sys  # System operations
from typing import List, Optional
from uuid import UUID
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, str(__file__).rsplit("/", 2)[0])

# Local imports
from app.core.database import get_db_session
from app.core.logging_config import get_logger, setup_logging
from app.core.security import hash_password
from app.models.venue import Venue
from app.models.vendor import VendorCredential
from app.utils.validators import validate_email

# Third-party
from sqlalchemy import select
from sqlalchemy.orm import selectinload

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# PASSWORD GENERATION
# =============================================================================
def generate_secure_password(length: int = 12) -> str:
    """
    Generate a secure random password.
    
    The password will contain:
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
    
    Args:
        length: Password length (minimum 12)
    
    Returns:
        str: Generated password
    """
    # Ensure minimum length
    length = max(12, length)
    
    # Character sets
    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    digits = string.digits
    special = "!@#$%^&*"
    
    # Start with required characters
    password = [
        secrets.choice(uppercase),
        secrets.choice(lowercase),
        secrets.choice(digits),
        secrets.choice(special),
    ]
    
    # Fill remaining length with random characters from all sets
    all_chars = uppercase + lowercase + digits + special
    password.extend(secrets.choice(all_chars) for _ in range(length - 4))
    
    # Shuffle the password
    secrets.SystemRandom().shuffle(password)
    
    return "".join(password)


def generate_vendor_email(venue_name: str, domain: str = "nexusfamily.pass") -> str:
    """
    Generate a vendor email from venue name.
    
    Args:
        venue_name: Name of the venue
        domain: Email domain
    
    Returns:
        str: Generated email address
    """
    # Clean venue name for email
    import re
    clean_name = re.sub(r"[^a-zA-Z0-9]", "", venue_name.lower())
    clean_name = clean_name[:20]  # Limit length
    
    # Add random suffix for uniqueness
    suffix = secrets.token_hex(2)
    
    return f"vendor.{clean_name}.{suffix}@{domain}"


# =============================================================================
# SEEDING FUNCTIONS
# =============================================================================
async def seed_vendor_accounts(
    venue_id: Optional[UUID] = None,
    default_password: Optional[str] = None,
    dry_run: bool = False,
    export_path: Optional[str] = None,
) -> dict:
    """
    Seed vendor accounts for venues.
    
    Args:
        venue_id: Optional specific venue to create account for
        default_password: Use this password for all accounts (testing only!)
        dry_run: If True, don't save to database
        export_path: Path to export credentials CSV
    
    Returns:
        dict: Summary of seeding results including credentials
    """
    logger.info("Starting vendor account seeding...")
    
    # Track results
    results = {
        "venues_processed": 0,
        "accounts_created": 0,
        "accounts_skipped": 0,
        "credentials": [],  # List of (venue_name, email, password) for output
        "errors": [],
    }
    
    async with get_db_session() as db:
        # Build query
        if venue_id:
            query = select(Venue).where(Venue.id == venue_id)
        else:
            query = select(Venue).where(Venue.is_active == True)
        
        # Load vendor credentials relationship
        query = query.options(selectinload(Venue.vendor_credentials))
        
        venue_result = await db.execute(query)
        venues = venue_result.scalars().all()
        
        logger.info(f"Found {len(venues)} venues to process")
        
        for venue in venues:
            try:
                # Check if vendor account already exists
                if venue.vendor_credentials:
                    logger.debug(f"Skipping {venue.name}: vendor account exists")
                    results["accounts_skipped"] += 1
                    continue
                
                # Generate credentials
                email = generate_vendor_email(venue.name)
                password = default_password or generate_secure_password()
                name = f"Vendor - {venue.name[:50]}"
                
                if dry_run:
                    logger.info(f"[DRY RUN] Would create account for {venue.name}")
                    logger.info(f"  Email: {email}")
                    logger.info(f"  Password: {password}")
                    
                    results["credentials"].append({
                        "venue_id": str(venue.id),
                        "venue_name": venue.name,
                        "email": email,
                        "password": password,
                    })
                    results["accounts_created"] += 1
                    results["venues_processed"] += 1
                    continue
                
                # Create vendor credential
                vendor = VendorCredential(
                    venue_id=venue.id,
                    email=email,
                    password_hash=hash_password(password),
                    name=name,
                    is_active=True,
                )
                
                db.add(vendor)
                await db.commit()
                
                # Store credentials for output
                results["credentials"].append({
                    "venue_id": str(venue.id),
                    "venue_name": venue.name,
                    "email": email,
                    "password": password,
                })
                
                results["accounts_created"] += 1
                results["venues_processed"] += 1
                
                logger.info(f"Created vendor account for {venue.name}")
                
            except Exception as e:
                logger.error(f"Error processing venue {venue.name}: {e}")
                results["errors"].append(f"{venue.name}: {str(e)}")
                await db.rollback()
    
    # Export credentials to CSV if requested
    if export_path and results["credentials"]:
        try:
            with open(export_path, "w", newline="") as csvfile:
                fieldnames = ["venue_id", "venue_name", "email", "password"]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for cred in results["credentials"]:
                    writer.writerow(cred)
            
            logger.info(f"Credentials exported to {export_path}")
            
        except Exception as e:
            logger.error(f"Failed to export credentials: {e}")
            results["errors"].append(f"Export failed: {str(e)}")
    
    logger.info(
        f"Seeding complete: {results['accounts_created']} accounts created, "
        f"{results['accounts_skipped']} skipped"
    )
    
    return results


# =============================================================================
# MAIN
# =============================================================================
def main():
    """Main entry point for the script."""
    
    # Set up argument parser
    parser = argparse.ArgumentParser(
        description="Seed vendor accounts for venues"
    )
    
    parser.add_argument(
        "--venue-id",
        type=str,
        help="Create account for a specific venue UUID",
    )
    
    parser.add_argument(
        "--default-password",
        type=str,
        help="Use this password for all accounts (testing only!)",
    )
    
    parser.add_argument(
        "--export",
        type=str,
        metavar="FILE",
        help="Export credentials to CSV file",
    )
    
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Don't save to database, just show what would be done",
    )
    
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging",
    )
    
    args = parser.parse_args()
    
    # Set up logging
    setup_logging()
    
    # Parse venue ID if provided
    venue_id = None
    if args.venue_id:
        try:
            venue_id = UUID(args.venue_id)
        except ValueError:
            logger.error(f"Invalid venue ID: {args.venue_id}")
            sys.exit(1)
    
    # Warn about default password
    if args.default_password:
        logger.warning(
            "Using default password for all accounts. "
            "This should only be used for testing!"
        )
    
    # Run seeding
    results = asyncio.run(
        seed_vendor_accounts(
            venue_id=venue_id,
            default_password=args.default_password,
            dry_run=args.dry_run,
            export_path=args.export,
        )
    )
    
    # Print summary
    print("\n" + "=" * 60)
    print("VENDOR ACCOUNT SEEDING SUMMARY")
    print("=" * 60)
    print(f"Venues processed: {results.get('venues_processed')}")
    print(f"Accounts created: {results.get('accounts_created')}")
    print(f"Accounts skipped: {results.get('accounts_skipped')}")
    
    if results.get("errors"):
        print(f"\nErrors ({len(results['errors'])}):")
        for error in results["errors"][:5]:
            print(f"  - {error}")
    
    # Print credentials (only if not exported)
    if results.get("credentials") and not args.export:
        print("\n" + "-" * 60)
        print("GENERATED CREDENTIALS")
        print("-" * 60)
        print("IMPORTANT: Store these securely and distribute to vendors!")
        print("-" * 60)
        
        for cred in results["credentials"]:
            print(f"\nVenue: {cred['venue_name']}")
            print(f"Email: {cred['email']}")
            print(f"Password: {cred['password']}")
    
    if args.export:
        print(f"\nCredentials exported to: {args.export}")


if __name__ == "__main__":
    main()
