/** Init aliases (once) */
require("module-alias/register");

const express = require("express");
const app = express();
require("@/core/setup")(app);

const config = require("@/config");
const apiRoutes = require("@routes/api");
const logger = require("@utils/logger");
const errorHandler = require("@middlewares/errorHandler");
const ROUTES = require("@routes/routes");
const { connect } = require("@/app/services/db/db.service");
const { getRoutes, logRoutes } = require("@/app/services/routes/routes.service");
const { toMs } = require("@utils/index");

const limiter = require("@middlewares/limiter");

const apiLimiter = limiter({ maxLimit: 5, timeDelay: toMs({ s: 2 }) }); // Limit users to 5 requests each 2s

app.use(ROUTES.API_BASE, apiLimiter, apiRoutes);

// Error Handling Middleware
app.use(errorHandler.e404);
app.use(errorHandler.e500);

app.listen(config.port, async () => {
  console.clear();
  if (config.setupDb) await connect();

  const address = config.isDev ? "http://localhost:" : "port ";

  getRoutes(app);
  logRoutes();

  logger.info(`Server is running on ${address}${config.port}`); //shows in console and saved in log file
});
