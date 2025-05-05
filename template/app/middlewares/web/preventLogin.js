const ROUTES = require("@routes/routes");
const jwt = require("jsonwebtoken");
const CookieService = require("@services/cookies");
const config = require("@/config");


/**
 * @type {import('types').HandlerType}
*/
module.exports = (req, res, next) => {
  const token = CookieService.of(req, res).get(config.authToken);
  if (!token) {
    return next();
  }
  try {
    jwt.verify(token, config.jwtSecret);
    return res.redirect(ROUTES.BASE);
  } catch (err) {
      return next();
  }
};
