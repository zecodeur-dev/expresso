const { e400 } = require("@middlewares/errorHandler");
const LangService = require("@/app/services/lang/lang.service");
class HomeController {
  static async index(req, res) {
    try {
      const user = req.user;
      LangService.setVars(res, { name: user.email });
      return res.render("index", { user });
    } catch (err) {
      console.log(err.message);
      req.error = err;
      e400(req, res);
    }
  }
}

module.exports = HomeController;
