/**
 * The server environment variables configuration
 */
export default () => ({
  version: process.env.npm_package_version,
  environment: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  logLevel: process.env.LOG_LEVEL.split(','),
  domain: process.env.DOMAIN,
  database: {
    databaseName: process.env.DATABASE_NAME,
    databaseUri: process.env.DATABASE_URI,
    databasePort: process.env.DATABASE_PORT,
    databaseUsername: process.env.DATABASE_USERNAME,
    databasePassword: process.env.DATABASE_PASSWORD,
  },
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET,
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET,
    },
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: JSON.parse(process.env.SMTP_SECURE),
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
  },
  google: {
    authClientId: process.env.GOOGLE_AUTH_CLIENT_ID,
    authClientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
  },
});
