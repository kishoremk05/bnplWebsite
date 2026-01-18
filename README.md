# Regal Pay - Buy Now Pay Later Platform

A comprehensive BNPL (Buy Now Pay Later) platform built with modern web technologies, providing flexible payment solutions for customers and merchants.

## 🚀 Features

### For Customers
- **Flexible Payment Plans**: Choose from multiple installment options
- **Instant Approval**: Quick credit assessment and approval process
- **Secure Payments**: Stripe-powered payment processing
- **Payment Tracking**: Monitor upcoming payments and payment history
- **KYC Verification**: Secure identity verification process

### For Merchants
- **Easy Integration**: Simple SDK integration for e-commerce platforms
- **Real-time Dashboard**: Monitor applications and transactions
- **Automated Approvals**: Streamlined application review process
- **Settlement Management**: Track settlements and payouts
- **Analytics**: Comprehensive business insights

### For Administrators
- **User Management**: Manage customers and merchants
- **KYC Review**: Review and approve identity verifications
- **Merchant Approvals**: Approve merchant registrations
- **Transaction Monitoring**: Oversee all platform transactions
- **Compliance Tools**: Ensure regulatory compliance

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Payments**: Stripe
- **Authentication**: Supabase Auth
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+ & npm
- Supabase account
- Stripe account (for payments)

## 🏃 Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GIT_URL>
cd regal-pay-main
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Set up Supabase

1. Create a new Supabase project
2. Run the migrations in the `supabase/migrations` folder
3. Deploy Edge Functions from `supabase/functions`

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### 5. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📦 Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## 🚀 Deployment

### Deploy to Vercel

See [DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md) for deployment instructions.

Quick deploy:

```bash
npm install -g vercel
vercel --prod
```

## 🔑 Admin Access

- **URL**: `/admin-login`
- **Email**: `admin@gmail.com`
- **Password**: `admin@2026`

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Complete setup instructions
- [Testing Guide](./TESTING.md) - How to test the platform
- [Deployment Guide](./DEPLOY_TO_VERCEL.md) - Deploy to Vercel
- [Stripe Migration](./STRIPE_MIGRATION.md) - Stripe integration details

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for testing
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
regal-pay-main/
├── src/
│   ├── components/        # React components
│   │   ├── admin/        # Admin components
│   │   ├── customer/     # Customer components
│   │   ├── merchant/     # Merchant components
│   │   └── ui/           # Shared UI components
│   ├── contexts/         # React contexts
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── types/            # TypeScript types
│   └── integrations/     # Third-party integrations
├── supabase/
│   ├── functions/        # Edge Functions
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## 🔐 Security

- All sensitive data is encrypted
- Row Level Security (RLS) enabled on all tables
- Secure authentication with Supabase Auth
- PCI-compliant payment processing with Stripe

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

For support, please contact the development team or refer to the documentation files.

---

**Version**: 1.0.0  
**Last Updated**: January 2026
