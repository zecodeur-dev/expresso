const CookieService = require("@services/cookies");

/**
 * Middleware to get theme from request or cookies and set theme for views
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
module.exports = function (req, res, next) {
  let theme = CookieService.of(req, res).get("theme");
  res.locals.theme = theme;
  next();
};
