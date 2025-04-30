const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("@/config");

const baseMiddlewares = [
  cors(),
  cookieParser(config.jwtSecret),
  bodyParser.json({ limit: config.parserJsonLimit }),
  bodyParser.urlencoded({ extended: true, limit: config.parserLimit }),

  require("@services/routes").middleware,
  require("@services/lang").middleware(false),
  require("@services/upload").router,
];

function setup(app) {
  for (let middleware of baseMiddlewares) app.use(middleware);
}

module.exports = setup;
