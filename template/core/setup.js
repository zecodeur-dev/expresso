const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("@/config");
const express = require("express");
const authController = require("@controllers/web/auth.controller");

const baseMiddlewares = [
  cors(),
  cookieParser(config.jwtSecret),
  bodyParser.json({ limit: config.parserJsonLimit }),
  bodyParser.urlencoded({ extended: true, limit: config.parserLimit }),
  express.static(path.resolve(config.buildDir)),

  require("@middlewares/web/theme.middleware"),
  require("@services/routes/routes.service").middleware,
  require("@services/lang/lang.service").middleware(false),
  require("@services/upload/upload.service").router,
  require("@services/auth/google.auth.service").middleware(authController.googleLogin),
  require("./layout"),
];

function setup(app) {
  app.enable('trust proxy');
  app.set("view engine", "ejs");
  app.set("views", config.viewsDir);
  for (let middleware of baseMiddlewares) app.use(middleware);
}

module.exports = setup;
