<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

**Agorva Backend** - An agricultural marketplace platform built with NestJS that connects farmers, retailers, and consumers. Features include location-based product search with PostGIS, user authentication, email verification, and comprehensive product management.

## Project setup

```bash
$ pnpm install
```

## Environment Configuration

Create environment files based on your environment:

```bash
# Development
.env.development

# Staging
.env.staging

# Production
.env.production
```

Required environment variables:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`

## Database Migrations

```bash
# Run pending migrations
$ pnpm run migration:run

# Revert last migration
$ pnpm run migration:revert

# Show migration status
$ pnpm run migration:show

# Generate a new migration (after entity changes)
$ pnpm run migration:generate src/database/migrations/MigrationName

# Create a blank migration
$ pnpm run migration:create src/database/migrations/MigrationName
```

**Note:** After cloning the repository, run `pnpm run migration:run` to set up the database schema including PostGIS for location-based features.

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Features

### 🌍 Location-Based Product Search
Search for products near any location using PostGIS spatial queries:
- Find products within a specified radius (up to 500km)
- Accurate distance calculations using Earth's spherical geometry
- Filter by category, certifications, price, seller type
- Check delivery availability based on seller's delivery radius
- Sort by distance, price, rating, or popularity

**Endpoint:** `POST /products/search/location`

See [LOCATION_SEARCH.md](./LOCATION_SEARCH.md) for detailed documentation.

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Email verification with 6-digit tokens
- Multi-role support (Farmer, Retailer, Consumer, Admin)
- Password reset functionality

### 👨‍🌾 Farmer Management
- Comprehensive farm profiles with certifications
- Multiple pickup locations
- Delivery settings and radius configuration
- Farm images and ratings

### 🏪 Retailer Management
- Business profiles with operating hours
- Multiple staff member support
- Delivery and pickup options
- Business verification system

### 📦 Product Management
- Rich product listings with images
- Bulk upload via CSV/Excel
- Product reviews and ratings
- Inventory management
- Multiple certifications support

### 📧 Email Service
- Verification emails on registration
- Password reset emails
- SMTP configuration with Nodemailer

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## API Documentation

Once the application is running, access the Swagger API documentation at:

```
http://localhost:3000/api
```

The Swagger UI provides interactive API documentation where you can test all endpoints.

## Tech Stack

- **Framework:** NestJS v11
- **Language:** TypeScript v5.7
- **Database:** PostgreSQL with PostGIS extension
- **ORM:** TypeORM v0.3
- **Authentication:** JWT + Passport
- **Email:** Nodemailer
- **Validation:** class-validator & class-transformer
- **API Documentation:** Swagger/OpenAPI
- **File Processing:** xlsx, papaparse

## Project Structure

```
src/
├── auth/           # Authentication & authorization
├── users/          # User management
├── farmers/        # Farmer profiles & management
├── retailers/      # Retailer profiles & management
├── products/       # Product management & search
├── locations/      # Geographic data (countries, states, cities)
├── email/          # Email service (Nodemailer)
├── common/         # Shared utilities, decorators, guards
├── config/         # Configuration files
└── database/       # Migrations
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
# agorva-be
