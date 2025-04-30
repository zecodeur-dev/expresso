/** Init aliases and tailwind (once) */
require("module-alias/register");
require("@/core/tailwind");

const express = require("express");
const app = express();
require("@/core/setup")(app);

const config = require("@/config");
const apiRoutes = require("@routes/api");
const webRoutes = require("@routes/web");
const ROUTES = require("@routes/routes");
const errorHandler = require("@middlewares/errorHandler");
const logger = require("@utils/logger");
const { connect } = require("@services/db");
const { getRoutes, logRoutes } = require("@services/routes");
const { toMs } = require("@utils/index");
const limiter = require("@middlewares/limiter");

const apiLimiter = limiter({ maxLimit: 5, timeDelay: toMs({ s: 2 }) }); // Limit users to 5 requests each 2s

app.use(ROUTES.API_BASE, apiLimiter, apiRoutes);
app.use(ROUTES.BASE, webRoutes);

app.use(errorHandler.e404);
app.use(errorHandler.e500);

app.listen(config.port, async () => {
  
  console.clear();
  if (config.setupDb) await connect();

  const address = config.isDev ? "http://localhost:" : "port ";

  getRoutes(app);
  logRoutes();

  logger.info(`Server is running on ${address}${config.port}`); //shows in console and saves in log file
});
