# SiteSage Backend

Automated SEO Performance Analyzer API. Analyze your website's SEO health with AI-powered insights and professional PDF reports.

**Live URL**: [https://sitesage-backend-hsm4.onrender.com/](https://sitesage-backend-hsm4.onrender.com/)

## Features

- ✅ **JWT Authentication**: Secure signup and login system.
- ✅ **Advanced Crawling**: Hybrid Cheerio (fast) and Puppeteer (JS-heavy) modes.
- ✅ **SEO Analysis**: Comprehensive rule-based scoring (0-100).
- ✅ **AI Insights**: Integrated with Google Gemini for smart SEO recommendations.
- ✅ **PDF Generation**: Professional reports with color-coded analysis.
- ✅ **Swagger UI**: Interactive API documentation.
- ✅ **CI/CD**: Automated testing and deployment to Render via GitHub Actions.

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Google Gemini API Key

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
# Ensure DATABASE_URL is set in your terminal or .env
npm run migrate

# Start development server
npm run dev
```

### Environment Variables

Required in `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sitesage
JWT_SECRET=your-secure-secret
GEMINI_API_KEY=your-gemini-key
PORT=4000
API_URL=https://your-app-url.com # Required for Swagger in production
NODE_ENV=production
```

## API Documentation

### Interactive Docs
- **Swagger UI**: [https://sitesage-backend-hsm4.onrender.com/api-docs/](https://sitesage-backend-hsm4.onrender.com/api-docs/)

### Key Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login and get JWT | Public |
| POST | `/api/audits` | Start SEO audit | JWT |
| GET | `/api/audits` | List user audits | JWT |
| GET | `/api/audits/:id` | Get audit details | JWT |

## Project Structure

```text
src/
├── __tests__/      # API Integration and Unit tests
├── controllers/     # Controller layer (Express handlers)
├── db/             # Database config, migrations, and queries
├── middleware/     # Custom middleware (Auth, error handling)
├── models/         # TypeScript interfaces and types
├── routers/        # Express routers with Swagger definitions
├── services/       # Core business logic
│   ├── seo-analyzer/ # Rule-based SEO logic and scoring
│   ├── ai-insights/  # Google Gemini AI integration
│   ├── pdf-generator/# PDF report creation
│   └── crawler/      # Web crawling engine (Cheerio/Puppeteer)
├── swagger/        # Swagger UI configuration
├── utils/          # Helpers (Logger, Result pattern, CustomError)
└── server.ts       # Application entry point
```

## Development & CI/CD

### Commands
- `npm run dev`: Start local development with reload.
- `npm test`: Run Jest test suite.
- `npm run build`: Compile TypeScript to `dist/`.
- `npm start`: Run compiled production build.

### CI/CD Workflow
SiteSage uses GitHub Actions for an automated pipeline:
1. **Test**: Runs the full test suite on every Push/PR.
2. **Build**: Verifies TypeScript compilation.
3. **Deploy**: Automatically deploys the latest `main` branch to **Render**.
