# Product Requirements Document
# Nexus Family Pass
## Corporate Kids Activity Platform

| Field | Details |
|-------|---------|
| Version | 7.0 (Enhanced AI Capabilities) |
| Status | Active Development |
| Author | AI Product Architect |
| Last Updated | January 2026 |
| AI Coverage | ~45-50% (Enhanced from 25-30%) |

---

## 1. Executive Summary

Nexus Family Pass is a B2B2C platform where companies purchase monthly activity subscriptions for employees with children. Unlike passive benefits, Nexus employs an **AI Curation Agent** that proactively matches children with pre-booked, high-quality activities using semantic understanding of child preferences and automated venue integrations. The platform prioritizes financial sustainability through intelligent inventory management and strict adherence to child data privacy and safety standards.

**Core Value Proposition:** "Guaranteed enrichment experiences, curated for your child's interests and automatically booked."

### 1.1 What's New in v7.0

This version introduces three high-value AI capabilities that significantly enhance the platform's intelligence layer:

- **Venue Performance Scoring:** AI-driven quality rankings improve curation reliability.
- **Natural Language Activity Search:** Parents describe preferences conversationally instead of using filters.
- **Sibling & Group Matching:** Intelligent joint booking recommendations for multi-child families.

---

## 2. Business Model & Supply Strategy

### 2.1 Revenue Streams

- **Corporate Subscription:** Companies pay $X/employee/month for activity credits.
- **Platform Fee:** 15-20% margin on pre-booked venue slots.
- **Premium Tier:** Additional credits or access to premium venues.

### 2.2 Financial Operations

- **Credit Consumption:** Credits are deducted at booking time to secure guaranteed revenue slots.
- **No-Show Policy:** Credits are forfeited (retained by platform) to cover venue slot costs.
- **Refund Policy:** Full credit refund for cancellations ≥48 hours prior. Cancellations <48 hours result in forfeiture.
- **Partial Refund:** If venue modifies activity (e.g., shorter duration), proportional credit returned.

### 2.3 Supply Strategy (Risk Mitigated)

- **Block Booking Model:** Platform pre-books specific time slots 30 days in advance.
- **72-Hour Release Clause:** Unsold inventory returned to venue without penalty.
- **Venue Benefits:** Guaranteed revenue for otherwise empty slots at full price.
- **Parent Benefits:** Access to curated, pre-vetted activities without booking hassle.

### 2.4 Payment Processing

Corporate invoicing handled via Stripe Connect or similar B2B payment gateway. Monthly invoices generated automatically with Net-30 terms. Integration with enterprise procurement systems (SAP, Coupa) for large accounts.

---

## 3. User Personas & Problems Solved

| Persona | Core Problem | How Nexus Solves |
|---------|--------------|------------------|
| Working Parent | No time to research/book quality activities; safety concerns. | AI suggests 3 personalized options monthly with one-click confirmation. |
| Multi-Child Parent (NEW) | Coordinating activities for siblings is exhausting; want them to attend together. | Sibling & Group Matching AI finds activities suitable for multiple children. |
| HR Benefits Manager | Low utilization, unclear ROI, cannot access private employee data. | Dashboard shows 85%+ utilization with measurable engagement; data anonymized. |
| Premium Venue Owner | Inconsistent weekend attendance; dislikes discounting. | Guaranteed revenue via block booking; AI scoring rewards quality with visibility. |

---

## 4. Core Features & Technical Implementation

### FEATURE 1: Child Interest Profile & Semantic Matching

**User Story:** "My 7-year-old loved the robotics workshop. Find similar activities that match her curious, building-oriented personality."

**Technical Implementation:**

- **Pinecone Vector Store:** Stores embeddings for activity descriptions, child feedback vectors, and past engagement patterns.
- **Cold Start Logic:** 3-question onboarding quiz generates initial seed vector (energy level, social preference, interest category).
- **Feedback Loop:** N8N triggers feedback request 1 hour post-activity for real-time vector updates.

**Semantic Search Flow:**

1. Geo-fence filter: Activities within 15-minute drive from home/school/office.
2. LLM converts query to embedding.
3. Pinecone similarity search (cosine similarity > 0.8).
4. Filter by available credits, child's age, and venue performance score (NEW).
5. Return top 3 matches with explanation.

---

### FEATURE 2: Natural Language Activity Search (NEW - AI ENHANCED)

**User Story:** "I want something outdoors that tires him out but isn't competitive—he hates losing."

**Problem Solved:**

Parents often struggle to express preferences using category dropdowns and filters. Natural language search allows them to describe what they want conversationally, capturing nuanced requirements that structured filters cannot.

**Technical Implementation:**

- **Intent Parsing:** LLM extracts structured attributes from free-text input (outdoor=true, energy=high, competitive=false).
- **Negation Handling:** Explicit detection of "not", "hates", "avoid" to create exclusion filters.
- **Ambiguity Clarification:** If query is too vague, agent asks one clarifying question before searching.
- **Integration Point:** Extends existing chat interface; parsed intent feeds into Pinecone semantic search.

**Example Flow:**

```
Parent: "Something creative but not messy—we have a car ride after."
System extracts: {creative: true, messy: false, portable_friendly: true}
Returns: "Digital Art Studio" (no paint), "Music Composition" (clean), "Architecture with LEGO" (contained)
```

---

### FEATURE 3: Venue Performance Scoring (NEW - AI ENHANCED)

**User Story:** "I want my child to only attend high-quality venues with consistently good experiences."

**Problem Solved:**

Not all venues deliver equal quality. Without scoring, the curation agent treats all venues equally, potentially recommending venues with declining quality or operational issues.

**Technical Implementation:**

- **Scoring Inputs (Weighted):**
  - Parent feedback average (40% weight)
  - Repeat booking rate (25% weight)
  - Venue-initiated cancellation rate (20% weight, negative)
  - No-show rate (15% weight, contextual)
- **Score Range:** 0-100, recalculated weekly via N8N workflow.
- **Curation Impact:** Venues with score <60 excluded from proactive suggestions; score displayed to parents on request.
- **Venue Feedback Loop:** Low-scoring venues receive automated improvement report with specific areas to address.

**Business Benefits:**

- Improves curation quality without manual review.
- Provides data-driven leverage for venue contract negotiations.
- Creates accountability that incentivizes venue quality improvements.

---

### FEATURE 4: Sibling & Group Matching (NEW - AI ENHANCED)

**User Story:** "I have a 6-year-old and a 9-year-old. Find something they can do together this Saturday."

**Problem Solved:**

Multi-child families spend significant effort coordinating separate activities. Group matching finds activities suitable for multiple children, reducing logistics burden and increasing credits consumed per booking session.

**Technical Implementation:**

- **Multi-Child Vector Comparison:** Computes intersection of interest vectors for siblings to find shared affinity areas.
- **Age Range Filtering:** Only surfaces activities with age brackets covering all selected children.
- **Schedule Alignment:** Calendar intersection logic identifies overlapping availability windows.
- **Group Inventory Check:** Verifies sufficient spots available for the group size before suggesting.
- **Coworker Matching (Optional):** With consent, matches children of coworkers for social enrichment.

**Example Flow:**

```
Parent: "Find something for Emma (6) and Jake (9) on Saturday afternoon."
System: Compares vectors → Both enjoy building + moderate energy
System: Filters age range 5-10 activities → Checks Saturday 1-5 PM availability
Returns: "Family LEGO Engineering" (age 5-12, 2 spots available, 3 PM)
```

**Business Benefits:**

- Increases credits consumed per booking session (2x or 3x for multi-child).
- Reduces parent coordination burden—key differentiator.
- Coworker matching creates social stickiness and word-of-mouth growth.

---

### FEATURE 5: Universal Venue Integration Layer

**User Story:** "Book my child into Saturday's art class, regardless of how the venue manages bookings."

**Technical Implementation:**

- **MCP (Model Context Protocol) Servers:** Standardized tools for different venue systems.
- **Concurrency Control:** Database-level optimistic locking for MVP; Redis at scale if contention >5%.
- **Inventory Sync Watchdog:** Hourly N8N workflow compares reservations; alerts ops on mismatch.

---

### FEATURE 6: Automated Lifecycle Management

**User Story:** "Automatically reset credits monthly, nudge inactive users, and reconcile bookings."

**N8N Workflow Orchestration:**

- **Workflow A - Monthly Credit Refresh:** Resets credits, triggers curation, sends notification.
- **Workflow B - Low Utilization Nudge:** Weekly check; generates personalized re-engagement.
- **Workflow C - Booking Reconciliation:** Daily attendance check; handles forfeiture/refunds.
- **Workflow D - Venue Score Calculation (NEW):** Weekly aggregation of feedback, cancellations, repeat rates.

---

### FEATURE 7: Proactive Curation Agent

**User Story:** "Don't make me search. Tell me the 3 best activities for my child this month."

**LangGraph State Management:**

- **State:** child_profile, available_credits, month_week, past_preferences, constraints, sibling_profiles (NEW).
- **Graph flow:** Check credits → Retrieve profile(s) → Apply constraints → Filter by venue score (NEW) → Generate suggestions → Book if approved.

---

### FEATURE 8: Waitlist Management

**User Story:** "The robotics class is full but I want to be notified if a spot opens."

- Parents join waitlist for full activities.
- Automatic notification when spot opens; 4-hour confirmation window.
- Priority: First-come, first-served.

---

## 5. Compliance, Safety & Privacy Framework

### 5.1 COPPA / GDPR-K Compliance

- **Verifiable Parental Consent:** Mandatory consent gate before creating child profile.
- **Data Isolation:** Child data logically separated from corporate user data.
- **Data Retention:** Child profiles retained for subscription + 90 days; purged within 30 days of deletion request.
- **Right to Deletion:** Parents can request complete data deletion at any time.

### 5.2 HR Data Privacy

- **Aggregate Reporting Only:** HR Dashboard displays only aggregate metrics.
- **No PII Exposure:** Individual activity data never visible to employer.

### 5.3 Venue Vetting Standard

All venues must pass Safety Protocol:

- Proof of $1M+ General Liability Insurance.
- Background checks for all instructors.
- Facility safety audit checklist.
- Annual re-verification required.

### 5.4 Accessibility Compliance

- Platform meets WCAG 2.1 Level AA standards.
- Activities tagged for accessibility features.

---

## 6. Technical Architecture

### 6.1 System Components & Responsibilities

| Component | Role | Justification |
|-----------|------|---------------|
| LangGraph | Curation Orchestrator | Multi-step curation with state; now handles sibling matching |
| Pinecone | Interest Graph Store | Semantic matching; multi-vector comparison for siblings |
| MCP | Venue API Unifier | Standardizes booking across systems |
| N8N | Lifecycle Automator | Scheduled ops, watchdogs, venue scoring workflow |
| LangSmith | Agent Transaction Auditor | Traces decisions including NL parsing |
| LLM (Claude) | NL Interface | Powers natural language search and intent extraction |
| PostgreSQL | Transactional DB | Users, credits, bookings, venue scores |
| Redis | Concurrency Manager | Race condition prevention (Phase 3) |

### 6.2 Authentication & Authorization

- **Authentication:** SSO (SAML 2.0/OIDC) for corporate; email/password with MFA for parents.
- **Role-Based Access:** Parent, HR Admin, Venue Admin, Platform Admin.

### 6.3 Error Handling & Fallbacks

- **Pinecone Unavailable:** Fallback to PostgreSQL-based filtering with degraded personalization notice.
- **NL Parsing Failure (NEW):** Fallback to structured filter UI with parsed partial attributes.
- **LangGraph Agent Failure:** Queue for retry; notify parent if delay exceeds 5 minutes.
- **MCP Integration Failure:** Email-based booking fallback with 4-hour manual confirmation.

### 6.4 Data Flow: Monthly Curation Cycle (Updated)

```
[DAY 1] → N8N resets credits & recalculates venue scores

[DAY 2-3] → LangGraph agent for each user:
  • Apply Geo-Fence & Constraints
  • Query Pinecone for child vector(s) - including siblings if applicable
  • Filter by venue performance score (exclude <60)
  • Generate 3 personalized options (or group options for multi-child)
  • Send "Monthly Menu" to parent

[DAY 4-28] → Parent reviews/approves/modifies
  • Can use natural language search for alternatives
  • If approved: MCP books (Deduct Credits per child)
  • Cancellation rules apply as before

[DAY 29-30] → N8N reconciles unused credits
```

### 6.5 Backup & Disaster Recovery

- Daily automated backups; 30-day retention; point-in-time recovery.
- **RPO:** 1 hour | **RTO:** 4 hours.

### 6.6 Mobile & Notifications

- **Phase 1:** Mobile-responsive web (PWA-ready).
- **Phase 3:** Native iOS/Android with push notifications.
- **Channels:** Email (default), SMS, WhatsApp, Push (configurable).

---

## 7. Success Metrics & KPIs

### 7.1 Primary Metrics

- **Utilization Rate:** >85% of credits redeemed monthly.
- **Venue Retention:** >90% renew block bookings quarterly.
- **Corporate Churn:** <5% annual cancellation rate.

### 7.2 Secondary Metrics

- **Curation Accuracy:** >70% parent-approved suggestions.
- **Time-to-Book:** <2 minutes from suggestion to confirmation.
- **Child Satisfaction:** Post-activity score target 4.5/5.0.

### 7.3 New AI Feature Metrics (NEW)

- **NL Search Usage:** >40% of searches use natural language instead of filters.
- **NL Parse Accuracy:** >90% of intents correctly extracted (validated via feedback).
- **Sibling Booking Rate:** >60% of multi-child families use group matching monthly.
- **Credits per Session:** 1.8x average for sibling bookings vs. single-child.
- **Venue Score Correlation:** Venues with score >80 have 20% higher repeat booking rate.

### 7.4 Safety & Compliance Metrics

- **Safety Incidents:** 0 verified incidents per annum.
- **Data Breaches:** 0 (COPPA/GDPR-K compliance maintained).

### 7.5 Technical Metrics

- **Agent Reliability:** >99% successful tool calls.
- **Automation Rate:** >95% bookings requiring zero manual intervention.
- **Inventory Sync Accuracy:** <0.1% discrepancy rate.

### 7.6 SLA Targets

- **Platform Uptime:** 99.5% monthly.
- **API Response Time:** <500ms for 95th percentile.
- **NL Query Response (NEW):** <2 seconds for intent parsing + results.

---

## 8. Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Venue No-Shows | Double-confirm via MCP 24hrs prior; maintain backup activity list. |
| Block Booking Liability | 72-hour release window; return unsold slots without penalty. |
| Low Personalization | 3-question quiz; 1-hour feedback loop; venue scoring filter. |
| NL Misinterpretation (NEW) | Confirmation prompt before search; fallback to structured filters. |
| Sibling Mismatch (NEW) | Show individual fit scores; allow parent override for group suggestions. |
| Venue Score Gaming (NEW) | Multi-signal scoring; anomaly detection for sudden feedback spikes. |
| Parent Overwhelm | Limit to 3 curated options; simple yes/no interface. |
| Credit Expiry Frustration | N8N offers last-minute options at 7-day warning. |
| Race Conditions | Database locking (MVP); Redis at scale. |
| Child Privacy (COPPA) | Consent gate; strict isolation; clear retention policies. |
| System Outages | Multi-AZ deployment; automated failover; defined RTO/RPO. |

---

## 9. Implementation Phases

### Phase 1: MVP (2 months)

- Basic credit system with 5 partner venues.
- Legal framework: Vetting protocols, consent gate, HR data anonymization.
- Simple LLM chat interface for booking (mobile-responsive web).
- N8N for monthly credit resets.
- Database-level locking for concurrency.
- **Target:** 100 corporate users, 70% utilization.

### Phase 2: Intelligence (3 months)

- Pinecone integration for child profiles (3-question onboarding).
- LangGraph curation agent (basic).
- MCP for 2 venue types + database locking.
- Post-activity feedback loops.
- Waitlist functionality.
- **Venue Performance Scoring (NEW):** Weekly N8N workflow calculates scores; integrates into curation filter.
- **Natural Language Search (NEW):** LLM intent parsing added to chat interface.
- **Sibling Matching - Basic (NEW):** Multi-child vector comparison; age range filtering.
- **Target:** 85% utilization, 75% curation approval, 40% NL search adoption.

### Phase 3: Scale (4 months)

- Full MCP suite (5+ venue systems).
- Redis distributed locking (if contention >5%).
- Advanced N8N workflows (reconciliation, inventory sync).
- Enterprise HR dashboard (aggregate view).
- Native mobile apps (iOS/Android) with push notifications.
- **Sibling Matching - Advanced (NEW):** Coworker opt-in matching; group inventory optimization.
- **Venue Score Transparency (NEW):** Parents can view venue scores on request.
- Multi-language support (Spanish, French).
- **Target:** 500 corporate users, <5% churn, 60% sibling booking adoption.

---

## 10. Audit Trail & Logging

- **User Actions:** Profile changes, bookings, consent logged with timestamp/IP.
- **Admin Actions:** Dashboard access, venue management, configuration changes.
- **AI Decisions (NEW):** NL parsing results, venue score calculations, sibling match logic traced via LangSmith.
- **Retention:** 2 years for compliance.

---

## 11. Testing Strategy

### 11.1 Testing Environments

- Development → Staging → Production (feature flags for rollouts).

### 11.2 Testing Types

- **Unit Tests:** >80% coverage for core logic.
- **Integration Tests:** MCP, N8N, Pinecone queries.
- **NL Parsing Tests (NEW):** Golden dataset of 200+ queries with expected extractions.
- **Sibling Matching Tests (NEW):** Edge cases for age gaps, conflicting preferences.
- **E2E Tests:** Critical user journeys.
- **Load Tests:** Peak booking simulation.
- **Security Tests:** Annual penetration testing.

---

## 12. Why This Architecture Wins

### For Technical Portfolio:

- **Strategic Thinking:** Solved supply problem before tech complexity.
- **AI Integration:** Three practical AI features that enhance UX without over-engineering.
- **Pragmatic Simplification:** Database locking before Redis; 3-question quiz; email fallbacks.
- **Tool Mastery:** Each technology solves a specific business gap.

### For the Business:

- **Sustainable Supply:** Venues get guaranteed revenue with clear exit strategy.
- **High Utilization:** Proactive curation + NL search beats passive browsing.
- **Multi-Child Advantage:** Sibling matching is a key differentiator vs. competitors.
- **Quality Assurance:** Venue scoring ensures consistently good experiences.
- **Trust & Safety:** Compliance-ready architecture builds trust.

**Resume One-Liner:** "Architected an AI-enhanced activity platform (45% AI coverage) serving 500+ corporate families, featuring natural language search, venue performance scoring, and sibling group matching—driving 85% credit utilization via LangGraph agents with Pinecone semantic matching, unified MCP venue integrations, and N8N lifecycle automation while ensuring COPPA compliance."

---

## Appendix A: AI Feature Summary

| Feature | AI Technique | Business Impact | Phase |
|---------|--------------|-----------------|-------|
| Semantic Matching | Vector embeddings + cosine similarity | Personalized recommendations | 2 |
| **Natural Language Search** | LLM intent parsing + negation detection | Removes filter friction; captures nuance | 2 |
| **Venue Performance Scoring** | Weighted multi-signal aggregation | Quality assurance; negotiation leverage | 2 |
| **Sibling & Group Matching** | Multi-vector intersection + schedule alignment | Higher credits/session; differentiator | 2-3 |
| Proactive Curation | LangGraph state machine + LLM generation | Drives utilization without user effort | 2 |
| Feedback Loop | Real-time vector updates | Continuous personalization improvement | 2 |

*Highlighted rows (bold) indicate new features added in v7.0*

---

## Appendix B: Cumulative Gap Analysis (v5.1 → v7.0)

| Gap Category | Resolution |
|--------------|------------|
| Authentication | Added SSO, MFA, RBAC |
| Error Handling | Fallbacks for Pinecone, LangGraph, MCP, NL parsing |
| Disaster Recovery | RPO/RTO targets, backup procedures |
| Mobile Strategy | PWA Phase 1, native apps Phase 3 |
| Data Retention | Specific periods, deletion procedures |
| Accessibility | WCAG 2.1 AA compliance |
| Waitlist | Priority queue with 4-hour window |
| SLA | Uptime, response time, support targets |
| Testing | Environments, test types, NL/sibling test suites |
| Audit Logging | Comprehensive trail including AI decisions |
| Payment Processing | Stripe Connect, invoicing |
| Concurrency | Progressive locking strategy |
| Search UX (NEW) | Natural language search with fallback |
| Quality Assurance (NEW) | Venue performance scoring |
| Multi-Child Support (NEW) | Sibling & group matching |

---

## Next Steps:

1. Finalize Phase 1 venue agreements with 72h release clauses.
2. Complete legal/compliance framework for child data.
3. Build NL parsing golden dataset for testing.
4. Design venue scoring weights with initial pilot data.
5. Establish sibling matching UX flows and edge case handling.
