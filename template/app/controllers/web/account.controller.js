const Errors = require("@/config/errors");
const {
  VerificationLink,
  PasswordResetLink,
} = require("@models/linkModel");
const User = require("@models/userModel");
const ROUTES = require("@routes/routes");
const AuthService = require("@/app/services/auth/auth.service");
const LangService = require("@/app/services/lang/lang.service");
const LinkService = require("@/app/services/link/link.service");
const UserService = require("@/app/services/user/user.service");

class AccountController {
  static async sendVerificationMail(req, res) {
    try {
      const user = req.user;
      if (user.accountVerified) {
        return res.redirect(ROUTES.BASE);
      }
      const email_sent = (await UserService.of(user).sendVerificationEmail()).sent;

      LangService.setVars(res, { email: `<b>${user.email}</b>` });
      return res.render("accountValidation", {
        message: email_sent
          ? res.locals.tr.email_sent
          : res.locals.tr.email_not_sent,
        email_sent,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({ error: err.message });
    }
  }

  static async verifyAccount(req, res) {
    try {
      const user = req.user;
      const link = await VerificationLink.findOne({ path: req.params.id });

      if (await LinkService.verify(link, user.id)) {
        await UserService.of(user).verifyUser();
        return res.redirect(ROUTES.BASE);
      }

      return res.status(400).json("Invalid link");
    } catch (err) {
      console.log(err);
      res.status(400).json({ error: err.message });
    }
  }

  static async passwordReset(req, res) {
    try {
      if (req.params.id) {
        const link = await PasswordResetLink.findOne({ path: req.params.id });
        if (!link || LinkService.hasExpired(link)) {
          return res.redirect(ROUTES.RESET_PASSWORD);
        }
      }
      return res.render("passwordReset", { id: req.params.id });
    } catch (err) {
      console.log(err);
      res.status(400).json({ error: err.message });
    }
  }

  static async sendPasswordResetMail(req, res) {
    try {
      const email = req.body.email;
      const user = await User.findOne({ email });
      if (!user) {
        return res.render("passwordReset", {
          message: res.locals.tr.email_not_sent,
          email_sent: false,
        });
      }
      const email_sent = (await UserService.of(user).sendPasswordResetEmail()).sent;

      return res.render("passwordReset", {
        message: email_sent
          ? res.locals.tr.email_sent
          : res.locals.tr.email_not_sent,
        email_sent,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({ error: err.message });
    }
  }

  static async resetPassword(req, res) {
    try {
      const link = await PasswordResetLink.findOne({ path: req.params.id });

      if (!link) {
        return res.redirect(ROUTES.RESET_PASSWORD);
      }

      if (!req.body.password || req.body.password.length < 6) {
        const errors = Errors.from(req, res);
        return res.render("passwordReset", {
          message: errors.code.PASSWORD_LENGTH.message,
          email_sent: false,
          id: req.params.id,
        });
      }

      const user = await User.findById(link.userId);

      await LinkService.expire(link);
      await UserService.of(user).resetPassword(req.body.password);
      return res.redirect(ROUTES.BASE);
    } catch (err) {
      console.log(err);
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = AccountController;
