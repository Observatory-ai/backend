# Observatory API

## Corequisites

This project must be run alongside the frontend. You can find our frontend repository [here](https://github.com/Observatory-ai/frontend).

## Installation

```bash
docker compose up -d
yarn install or yarn
yarn start
```

## Example .env file

```dosini
# Node Environment
NODE_ENV=development
# Log Level
LOG_LEVEL=log,warn,error
# Domain
DOMAIN=http://localhost:4000
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgrespassword
# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
# SMTP
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USERNAME=
SMTP_PASSWORD=
# Google
GOOGLE_AUTH_CLIENT_ID=
GOOGLE_AUTH_CLIENT_SECRET=
```

## Running the API

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
