# SiteSage Backend

Automated SEO Performance Analyzer API

## Features

- ✅ JWT Authentication (signup/login)
- ✅ URL Crawling (Cheerio + Puppeteer modes)
- ✅ SEO Analysis (rule-based scoring 0-100)
- ✅ AI Insights (Google Gemini integration)
- ✅ PDF Report Generation
- ✅ Batch URL Processing
- ✅ Swagger API Documentation
- ✅ Docker Support
- ✅ CI/CD with GitHub Actions

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Docker (optional)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run database migrations
psql $DATABASE_URL < src/db/migrations/001_users_table.sql
psql $DATABASE_URL < src/db/migrations/002_audits_schema.sql

# Start development server
npm run dev
```

### Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/sitesage
JWT_SECRET=your-secret-key-change-in-production
GEMINI_API_KEY=your-gemini-api-key
PORT=4000
API_URL=http://localhost:4000  # For Swagger (optional)
NODE_ENV=development
```

## API Documentation

### Swagger UI
- **Local**: http://localhost:4000/api-docs
- **Production**: https://yourdomain.com/api-docs

### Endpoints

**Authentication** (Public):
```
POST /api/auth/signup - Register new user
POST /api/auth/login - Login user
```

**Audits** (Protected - requires JWT):
```
POST /api/audits - Create SEO audit(s)
GET /api/audits/:id - Get audit by ID
GET /api/audits - List user's audits
```

**Example Request**:
```bash
# Signup
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Create Audit
curl -X POST http://localhost:4000/api/audits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "urls": ["https://example.com"],
    "crawlerMode": "standard",
    "generatePdf": false,
    "customPrompt": "Focus on mobile SEO"
  }'
```

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## Docker

### Build and Run
```bash
# Build image
docker build -t sitesage-backend .

# Run container
docker run -d \
  -p 4000:4000 \
  -e DATABASE_URL=your_db_url \
  -e JWT_SECRET=your_secret \
  -e GEMINI_API_KEY=your_key \
  sitesage-backend
```

### Using Docker Compose
```bash
docker-compose up -d
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## CI/CD

GitHub Actions workflow automatically:
- Runs tests on push/PR
- Builds Docker image
- Tests Docker container
- Deploys to production (on main branch)

See `.github/workflows/ci-cd.yml` for details.

## Architecture

```
Server → Router → Controller (thin) → Service (business logic)
```

All responses use standardized `Result` pattern with `CustomError` handling.

## Project Structure

```
src/
├── controllers/     # Request handlers (thin layer)
├── db/             # Database config, migrations, queries
├── middleware/     # Auth middleware
├── models/         # TypeScript interfaces
├── routers/        # Route definitions with Swagger docs
├── services/       # Business logic
│   ├── seo-analyzer/  # Rule-based SEO scoring
│   └── ...
├── swagger/        # API documentation config
├── utils/          # Helpers (CustomError, Result, constants)
└── __tests__/      # Test files
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- Swagger access in different environments
- Docker deployment
- Production configuration
- CI/CD setup

## License

MIT
