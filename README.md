# Observatory API

## Installation

```bash
$ yarn install
```

## Example .env file

```dosini
# Node Environment
NODE_ENV=development
# Log Level
LOG_LEVEL=log,warn,error
# Domain
DOMAIN=localhost
# Database
DATABASE_URI=
DATABASE_PORT=
DATABASE_USERNAME=
DATABASE_PASSWORD=
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
