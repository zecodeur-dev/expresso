const express = require("express");
const router = express.Router();
const homeController = require("@/app/controllers/web/home.controller");
const ROUTES = require("@routes/routes");
const webAuthMiddleware = require("@/app/middlewares/web/auth.middleware");
const authController = require("@/app/controllers/web/auth.controller");
const preventLogin = require("@middlewares/web/preventLogin");
const UploadService = require("@/app/services/upload/upload.service");
const accountMiddleware = require("@/app/middlewares/web/account.middleware");
const accountController = require("@/app/controllers/web/account.controller");

router.get(
  ROUTES.BASE,
  webAuthMiddleware,
  accountMiddleware,
  homeController.index
);

router.get(
  ROUTES.VERIFY_ACCOUNT,
  webAuthMiddleware,
  accountController.sendVerificationMail
);
router.get(
  `${ROUTES.VERIFY_ACCOUNT}${ROUTES.FIND}`,
  webAuthMiddleware,
  accountController.verifyAccount
);

router.get(ROUTES.RESET_PASSWORD, preventLogin, accountController.passwordReset);
router.get(
  `${ROUTES.RESET_PASSWORD}${ROUTES.FIND}`,
  preventLogin,
  accountController.passwordReset
);
router.post(
  ROUTES.RESET_PASSWORD,
  preventLogin,
  accountController.sendPasswordResetMail
);
router.post(
  `${ROUTES.RESET_PASSWORD}${ROUTES.FIND}`,
  preventLogin,
  accountController.resetPassword
);

// AUTH
router.get(ROUTES.LOGIN, preventLogin, authController.login);
router.get(ROUTES.LOGOUT, authController.logout);
router.get(ROUTES.REGISTER, preventLogin, authController.register);

router.post(ROUTES.LOGIN, authController.loginSubmit);
router.post(
  ROUTES.REGISTER,
  UploadService.middleware.single("image"),
  authController.registerSubmit
);

module.exports = router;
