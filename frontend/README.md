# Trading Platform - Multi-Ecosystem

A comprehensive trading platform built with Next.js 16, featuring HR Platform, Tender System, Product Marketplace, and Service Marketplace all in one unified ecosystem.

## Features

- **Authentication**: Secure registration, login, and email verification with OTP
- **Multi-Platform Support**: Access HR, Tender, Marketplace, and E-commerce platforms
- **KYC Verification**: Individual and Industrial/Company KYC forms with multi-step process
- **Gaming Theme**: Modern UI with cyan, pink, and purple gradients
- **Type-Safe**: Full TypeScript support with proper type definitions
- **Token Management**: Automatic access token and refresh token handling

## Project Structure

\`\`\`
app/
├── (public)/              # Public routes (landing, auth)
│   ├── page.tsx           # Landing page
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── (protected)/           # Protected routes (auth required)
│   ├── dashboard/         # Platform selector
│   ├── platforms/         # Platform-specific routes
│   │   └── [platform]/
│   │       ├── page.tsx   # Platform dashboard
│   │       └── kyc/       # KYC pages
│   └── layout.tsx
├── layout.tsx             # Root layout with AuthProvider
└── globals.css            # Tailwind + gaming theme styles

lib/
├── api/
│   ├── client.ts          # API client with token management
│   └── routes.ts          # Route definitions
├── hooks/
│   ├── use-auth.ts        # Authentication hook
│   ├── use-form-validation.ts  # Form validation
│   └── use-logout-on-error.ts  # Error handling
└── types/
    ├── auth.ts            # Auth types
    ├── platform.ts        # Platform types
    └── kyc.ts             # KYC types

components/
├── ui/
│   └── gaming-button.tsx  # Gaming-styled button
└── auth/
    ├── form-input.tsx     # Form input with validation
    ├── otp-input.tsx      # OTP input component
    └── auth-provider.tsx  # Auth context provider

middleware.ts             # Route protection middleware
\`\`\`

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running at `http://localhost:8000/api`

### Environment Setup

Create a `.env.local` file:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
\`\`\`

### Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:3000` in your browser.

## Authentication Flow

1. **Register**: User creates account with email and password
2. **Email Verification**: User receives OTP and verifies email
3. **Login**: User logs in with credentials
4. **Platform Selection**: User selects a platform to join
5. **KYC Submission**: User submits KYC (individual or industrial)
6. **Admin Approval**: Admin reviews and approves KYC
7. **Full Access**: User gains full access to platform

## API Integration

The frontend communicates with a backend API at `http://localhost:8000/api`. Key endpoints:

- `POST /auth/register` - Register new user
- `POST /auth/verify-email` - Verify email with OTP
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get user profile
- `POST /platform/kyc/submit` - Submit KYC

## Token Management

The app implements automatic token refresh:

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens are automatically refreshed every 10 minutes
- Failed authentication redirects to login

## Security Features

- Middleware-based route protection
- Automatic token refresh before expiry
- Secure localStorage token storage
- CORS headers configuration
- XSS and CSRF protections

## Gaming Theme

The app features a gaming aesthetic with:

- Cyan (#00f0ff), Pink (#ff0080), and Purple (#8000ff) color scheme
- Glowing button effects with animations
- Particle animations and grid backgrounds
- Orbitron and Rajdhani fonts for futuristic look
- Smooth transitions and hover effects

## Contributing

This is a v0.app generated project. For modifications, use the v0 interface.

## License

© 2025 Trading Platform. All rights reserved.
