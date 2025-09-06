const express = require("express");
const userController = require("@/app/controllers/api/user.controller");
const accountController = require("@/app/controllers/api/account.controller");
const ROUTES = require("@routes/routes");
const router = express.Router();

router.get(ROUTES.BASE, userController.getAllUsers);
router.get(ROUTES.GET, userController.getAllUsers);
router.get(`${ROUTES.GET}${ROUTES.FIND}`, userController.getUserById);
router.get(
  `${ROUTES.GET}${ROUTES.FIND}${ROUTES.GET_ATTRIBUTE}`,
  userController.getUserAttribute
);

router.get(
  `${ROUTES.VERIFY_ACCOUNT}${ROUTES.FIND}`,
  accountController.verifyAccount
);
router.post(
  `${ROUTES.VERIFY_ACCOUNT}`,
  accountController.sendVerificationMail
);

router.get(
  `${ROUTES.RESET_PASSWORD}${ROUTES.FIND}`,
  accountController.passwordResetHTML
);
router.post(
  `${ROUTES.RESET_PASSWORD}`,
  accountController.sendPasswordResetMail
);
router.post(
  `${ROUTES.RESET_PASSWORD}${ROUTES.FIND}`,
  accountController.resetPassword
);
module.exports = router;
