const Errors = require("../../../config/errors");
const ROUTES = require("@routes/routes");
const config = require("@/config");
const AuthService = require("@/app/services/auth/auth.service");
const CookieService = require("@/app/services/cookies/cookies.service");

/**
 * @type {import('types').HandlerType}
 */
module.exports = async (req, res, next) => {
  try {
    const errors = Errors.from(req, res);

    const user = req.user;
    if (!user) {
       CookieService.of(req, res).set("_exp", 1);
       return res.redirect(ROUTES.LOGOUT);
    }
    if (user.accountVerified != true) {
      return res.redirect(ROUTES.VERIFY_ACCOUNT);
    }

    if (user.accountLocked == true) {
      CookieService.of(req, res).clear(config.authToken);
      return res.render("login", {
        error: errors.code.ACCOUNT_LOCKED,
      });
    }
    return next();
  } catch (err) {
    console.log(err);
    return res.redirect("back");
  }
};
