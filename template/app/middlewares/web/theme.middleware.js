const CookieService = require("@/app/services/cookies/cookies.service");

/**
 * Middleware to get theme from request or cookies and set theme for views
 * @type {import('types').HandlerType}
 */
module.exports = function (req, res, next) {
  let theme = CookieService.of(req, res).get("theme");
  res.locals.theme = theme;
  next();
};
