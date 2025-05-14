# Survey Land Backend (Node.js/Express)

## Introduction
A robust backend system for managing surveys and file uploads with S3 integration. Features include:
- Secure JWT authentication
- Multi-language support (i18n)
- Image processing with Jimp
- Prisma ORM for database management
- Rate limiting and security headers

## Technologies
- Node.js v18+
- Express
- TypeScript
- Prisma
- AWS SDK v3
- Passport.js
- Jimp
- i18n

## Installation
```bash
git clone https://github.com/your-repo/survey-land-backend-node.git
cd survey-land-backend-node
npm install

# Setup environment
cp .env.example .env
```

### NPM Scripts
```bash
# Dev server with hot-reload
npm run dev

# Build TypeScript
npm run build

# Production start
npm start

# Database migrations
npm run prisma:migrate

# Prisma Studio (DB GUI)
npm run prisma:studio
```

## Environment Variables
```env
DATABASE_URL="mongodb+srv://"
JWT_SECRET=

REGION=
ACCESSKEYID=
SECRETACCESSKEY=

GOOGLE_CALLBACK_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=

NODEMAILER_SERVICE=
NODEMAILER_USER=
NODEMAILER_PASSWORD=
```

## API Endpoints
| Method | Endpoint       | Description          |
|--------|----------------|----------------------|
| POST   | /api/auth/login| User authentication  |
| POST   | /api/upload    | File upload to S3    |
| GET    | /api/surveys   | List surveys         |

## Contributing
1. Fork the repository
2. Create feature branch
3. Submit PR with description

## License
MIT License

## Acknowledgements
- Prisma Team
- AWS SDK Maintainers
- Express.js Community

   