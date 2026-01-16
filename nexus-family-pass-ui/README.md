# Nexus Family Pass - Angular Application

A comprehensive B2B2C platform enabling corporate employee benefits for kids' activity subscriptions with AI-powered curation.

## 🎯 Overview

Nexus Family Pass is a multi-portal system connecting:
- **Parents** - Browse activities, manage bookings, track credits
- **HR Administrators** - Manage employee benefits, view analytics
- **Venue Administrators** - Manage activities, handle bookings
- **Platform Administrators** - System-wide management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- Angular CLI 17+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nexus-family-pass

# Install dependencies
npm install

# Start development server
ng serve
```

The application will be available at `http://localhost:4200`

### Demo Accounts

The application includes mock authentication. Use any of these demo accounts (any password works):

| Portal | Email | Role |
|--------|-------|------|
| Parent | sarah.johnson@example.com | Parent |
| Parent | michael.chen@example.com | Parent |
| Parent | emily.wilson@example.com | Parent |
| HR Admin | hr.admin@techcorp.com | HR Administrator |
| Venue | owner@codeninjaswest.com | Venue Owner |
| Venue | hello@artfulkids.com | Venue Admin |
| Admin | admin@nexusfamilypass.com | Platform Admin |

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── data/               # Mock data
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   ├── models/             # TypeScript interfaces
│   │   └── services/           # Core services
│   │
│   ├── features/               # Feature modules
│   │   ├── auth/              # Authentication pages
│   │   ├── parent/            # Parent portal
│   │   ├── hr/                # HR admin portal
│   │   ├── venue/             # Venue admin portal
│   │   └── admin/             # Platform admin portal
│   │
│   ├── layouts/               # Layout components
│   │   ├── parent-layout/
│   │   ├── hr-layout/
│   │   ├── venue-layout/
│   │   └── admin-layout/
│   │
│   ├── shared/                # Shared components
│   │   └── components/
│   │
│   ├── app.component.ts       # Root component
│   ├── app.config.ts          # App configuration
│   └── app.routes.ts          # Route definitions
│
├── styles.scss                # Global styles
├── index.html                 # HTML entry point
└── main.ts                    # Bootstrap entry point
```

## 🛠 Tech Stack

- **Framework**: Angular 17+ (Standalone Components)
- **UI Library**: Angular Material
- **Styling**: Tailwind CSS with custom theme
- **State Management**: Angular Signals
- **Forms**: Reactive Forms
- **HTTP**: HttpClient with Interceptors
- **Routing**: Angular Router with Lazy Loading

## 🎨 Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary | #2c5282 | Main brand color |
| Accent | #319795 | Secondary actions |
| Success | #38a169 | Success states |
| Warning | #ed8936 | Warnings |
| Danger | #e53e3e | Errors |

### Typography

- **Display Font**: Poppins (headings)
- **Body Font**: Inter (body text)

## 📦 Key Features

### Parent Portal
- Dashboard with credit summary and upcoming bookings
- AI-curated activity suggestions based on children's interests
- Activity browsing with filters and search
- Natural language search ("art classes for 8-year-old")
- Single and group booking for siblings
- Booking management with cancellation
- Waitlist tracking with instant notifications
- Children profile management with onboarding quiz
- Notification center with preferences
- Settings for profile and preferences

### HR Admin Portal
- Company dashboard with KPIs (utilization, engagement)
- Employee management with bulk invitations
- Usage analytics and exportable reports
- Subscription management
- Department utilization tracking
- Credit allocation settings

### Venue Admin Portal
- Booking calendar with session view
- Activity management (create, edit, scheduling)
- Session attendance/check-in system
- Performance analytics and trends
- Review management
- Venue profile settings

### Platform Admin Portal
- Platform-wide dashboard
- Company management
- Venue management and approval workflow
- User management across all roles
- Booking oversight
- Platform analytics and reports
- System settings

## 🧩 Shared Components

- **Header** - Global navigation with user menu
- **Sidebar** - Collapsible navigation for all portals
- **Footer** - Copyright and links
- **Loading Spinner** - Global/local loading states
- **Empty State** - Friendly empty list displays
- **Skeleton Loader** - Loading placeholders

## 📦 Modal Components

- **Booking Confirmation** - Post-booking success with calendar export
- **Cancel Booking** - Cancellation with refund policy
- **Waitlist Spot Available** - Countdown timer for claiming spots
- **Feedback Modal** - Quick thumbs up/down post-activity
- **Review Modal** - Detailed star rating review
- **Credit Expiry Warning** - 7-day expiration reminder
- **Invite Employees** - Bulk CSV upload for HR

## 🔒 Authentication & Authorization

- JWT-based authentication (mock implementation)
- Role-based access control via route guards
- Auth interceptor for API requests
- Guest guard for public pages

## 🧪 Development

### Build

```bash
# Development build
ng build

# Production build
ng build --configuration production
```

### Testing

```bash
# Unit tests
ng test

# E2E tests
ng e2e
```

### Linting

```bash
ng lint
```

## 📄 License

Proprietary - Nexus Family Pass © 2024

## 🤝 Contributing

1. Follow the Angular style guide
2. Use conventional commits
3. Ensure all tests pass
4. Submit PR for review

---

For questions or support, contact the development team.
