const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("@/config");

const baseMiddlewares = [
  cors(),
  cookieParser(config.jwtSecret),
  bodyParser.json({ limit: config.parserJsonLimit }),
  bodyParser.urlencoded({ extended: true, limit: config.parserLimit }),

  require("@/app/services/routes/routes.service").middleware,
  require("@/app/services/lang.service").middleware(false),
  require("@/app/services/upload/upload.service").router,
];

function setup(app) {
  app.enable('trust proxy');
  for (let middleware of baseMiddlewares) app.use(middleware);
}

module.exports = setup;
