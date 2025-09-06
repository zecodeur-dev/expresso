const dotenv = require("dotenv");
dotenv.config();

const env = process.env;

var dbUri;
if (env.MONGODB_URI) {
  if (env.MONGODB_URI.endsWith("/"))
    env.MONGODB_URI = env.MONGODB_URI.slice(0, -1);
  let params;
  if (env.MONGODB_URI.includes("?")) {
    params = env.MONGODB_URI.split("?")[1];
    env.MONGODB_URI = env.MONGODB_URI.split("?")[0];
  }

  dbUri = `${env.MONGODB_URI}/${env.MONGODB_DBNAME}${
    params ? "?" + params : ""
  }`;
} else {
  dbUri = `${env.MONGODB_HOST || "127.0.0.1"}:${
    env.MONGODB_PORT || 27017
  }/${env.MONGODB_DBNAME}`;

  if (env.MONGODB_USER && env.SETUP_DB == "true") {
    if (!env.MONGODB_PASSWORD)
      console.log("WARNING: Login DB without password.");
    dbUri = `${env.MONGODB_USER}:${env.MONGODB_PASSWORD}@${dbUri}`;
  }
  dbUri = `mongodb://${dbUri}`;
}
const environment = env.NODE_ENV || "development";

module.exports = {
  dbUri,
  environment,

  buildDir: "public",
  viewsDir: "app/views/pages",

  port: env.PORT || 300,
  dbHost: env.MONGODB_HOST,
  dbPort: env.MONGODB_PORT,
  dbName: env.MONGODB_DBNAME || "",
  setupDb: env.SETUP_DB == "true",

  cryptoSecret: env.CRYPTO_SECRET,
  jwtSecret: env.JWT_SECRET,

  parserLimit: env.PARSER_LIMIT || "50mb",
  parserJsonLimit: env.PARSER_JSON_LIMIT || "50mb",
  jwtMaxDate: env.JWT_MAX_DATE || "30d",
  cookieMaxDate: env.COOKIE_MAX_DATE || "1y",

  authToken: env.AUTH_TOKEN || "_tk",
  googleAuthClientId: env.GOOGLE_AUTH_CLIENT_ID,
  googleAuthClientSecret: env.GOOGLE_AUTH_CLIENT_SECRET,

  appId: env.APP_ID || "",
  appLang: env.APP_LANG || "en",

  stripePublishableKey: env.STRIPE_PK,
  stripeSecretKey: env.STRIPE_SK,

  mailerHost: env.MAILER_HOST || "smtp.gmail.com",
  mailerPort: env.MAILER_PORT || 465,
  mailerUser: env.MAILER_USER,
  mailerPwd: env.MAILER_PWD,
  mailerAppName: env.MAILER_APPNAME,
  mailerReceivers: (env.MAILER_RECEIVERS ?? "").split(","),

  isDev: ["dev", "development", "develop", "test"].includes(environment),
  isProd: ["prod", "production", "release", "released"].includes(environment),
};
