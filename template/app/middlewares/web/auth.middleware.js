const ROUTES = require("@routes/routes");
const jwt = require("jsonwebtoken");
const User = require("@models/userModel");
const Errors = require("@/config/errors");

const CookieService = require("@/app/services/cookies/cookies.service");
const config = require("@/config");

/**
 * @type {import("types").HandlerType}
 */
module.exports = async (req, res, next) => {
  const { code } = Errors.from(req, res);
  const token = CookieService.of(req, res).get(config.authToken);
  if (!token) {
    return res.redirect(ROUTES.LOGIN + `?redirect=${req.originalUrl}`);
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.headers.authorization = token;
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error(code.USER_NOT_FOUND);
    req.user = user;
    next();
  } catch (err) {
    CookieService.of(req, res).set("_exp", 1);
    return res.redirect(ROUTES.LOGOUT);
  }
};
