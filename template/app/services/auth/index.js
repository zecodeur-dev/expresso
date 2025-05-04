const jwt = require("jsonwebtoken");
const config = require("@/config");
const User = require("@models/userModel");
const CookieService = require("../cookies");
const PaymentService = require("../payment");

/**
 * Service for handling authentication and user-related operations.
 * Includes functionality for generating tokens, authenticating users,
 * and integrating with Stripe for subscription management.
 */
class AuthService {
  /**
   * Generates a JSON Web Token (JWT) for a user.
   * @param {object} user - The user object containing at least an `id` property.
   * @returns {string} The generated JWT.
   */
  static generateToken = (user) => {
    return jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: config.jwtMaxDate,
    });
  };

  /**
   * Authenticates a user based on a token stored in cookies.
   * Optionally integrates with Stripe to fetch subscription details.
   *
   * @param {object} req - The HTTP request object, containing cookies and headers.
   * @param {object} [options] - Options when getting user.
   * @param {boolean} [options.withStripe=false] - Whether to fetch Stripe subscription details for the user.
   * @param {boolean} [options.fromHeader=false] - Whether to get token from authorization header.
   * @returns {Promise<import("types").UserType>|null>>} The authenticated user object, including Stripe data if requested, or `null` if authentication fails.
   */

  static async authUser(
    req,
    options = {
      withStripe: false,
      fromHeader: false,
    }
  ) {
    const token = options.fromHeader
      ? req.headers.authorization.replace("Bearer ", "")
      : CookieService.of(req, null).get(config.authToken);

    if (!token) {
      return null;
    }
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.headers.authorization = token;
      req.user = decoded;
      const user = await User.findById(req.user.userId);
      if (!user) return null;

      if (!options.withStripe) return user;

      return await PaymentService.userWithStripe(user);
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

module.exports = AuthService;
