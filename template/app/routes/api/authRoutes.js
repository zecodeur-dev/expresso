const express = require("express");
const authController = require("@/app/controllers/api/auth.controller");
const authMiddleware = require("@/app/middlewares/api/auth.middleware");
const ROUTES = require("@routes/routes");

const router = express.Router();

router.get(ROUTES.USER, authMiddleware, authController.user);

router.post(ROUTES.AUTH_LOGIN, authController.login);
router.post(ROUTES.AUTH_REGISTER, authController.register);

module.exports = router;
