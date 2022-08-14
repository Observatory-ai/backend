# Observatory API

## Installation

1. Install the Hasura CLI:
   [Hasura CLI Installation](https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/)

2. Run the following commands:

```bash
docker compose up -d
yarn install or yarn
```

3. Start the Hasura Client:

```bash
hasura console
```

## Hasura usage

### Connecting to the observatory database in Hasura

![hasura databse connection](https://drive.google.com/uc?id=1b9AEGIfOmNrzf0iZqwMi_YpY9Ll-eCDq)

### Hasura commands

NOTE: THE FOLLOWING COMMANDS SHOULD NOT BE USED. DATABASE MODIFICATIONS ARE MANAGED BY THE API

- Add a migration

```bash
hasura migrate create "migration-name" --from-server --database-name observatory
```

- Apply migrations

```bash
hasura migrate apply --database-name JoistAnalyzer
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
DATABASE_URL=postgres://postgres:postgrespassword@localhost:5432/postgres
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
