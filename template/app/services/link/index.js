const {
  VerificationLink,
  PasswordResetLink,
  Link,
  Links,
} = require("@models/linkModel");
const Utils = require("../../utils");
const DateService = require("../date");

/**
 * Service for managing verification, password reset and other types of link
 */
class LinkService {
  /**
   * Creates a new link for a user based on the specified type and expiration time.
   *
   * @param {string} userId - The ID of the user the link is associated with.
   * @param {string} type - The type of link to create (e.g., VERIFICATION, PASSWORD_RESET).
   * @param {Object} expireIn - The expiration time for the link (default is 1 hour).
   * @param {number} expireIn.h - Hours to expire.
   * @param {number} expireIn.s - Seconds to expire.
   * @param {number} expireIn.m - Minutes to expire.
   * @param {number} expireIn.ms - Milliseconds to expire.
   * @param {number} expireIn.d - Days to expire.
   *
   * @returns A promise that resolves to the created link.
   */
  static async create(
    userId,
    type,
    expireIn = { h: 1, s: 0, m: 0, ms: 0, d: 0 }
  ) {
    /**
     * @type {import("types").LinkType}
     */
    var link;
    switch (type) {
      case Links.VERIFICATION:
        link = new VerificationLink();
        break;
      case Links.PASSWORD_RESET:
        link = new PasswordResetLink();
        break;

      default:
        link = new Link();
        break;
    }
    link.path = `${Utils.generateRandomString()}-${Date.now()}-${Utils.generateRandomString()}-${Utils.generateRandomString()}`;
    link.userId = userId;

    const { h, s, m, ms, d } = expireIn;
    link.expireAt = DateService.addToDate({ h, s, m, ms, d });

    await link.save();
    return link;
  }

  /**
   * Expires a given link by setting its expiration time to the current time.
   *
   * @param {import("types").LinkType} link - The link object to expire.
   * @returns A promise that resolves to the expired link.
   */
  static async expire(link) {
    link.expireAt = Date.now();
    await link.save();
    return link;
  }

  /**
   * Verifies if the link is valid for the specified user and expires it.
   *
   * @param {import("types").LinkType} link - The link to verify.
   * @param {string} userId - The ID of the user to verify the link for.
   * @returns A promise that resolves to true if the link is valid, false otherwise.
   */
  static async verify(link, userId) {
    if (!link || LinkService.hasExpired(link) || link.userId != userId)
      return false;

    await LinkService.expire(link);
    return true;
  }

  /**
   * Checks if the given link has expired.
   *
   * @param {import("types").LinkType} link - The link to check for expiration.
   * @returns {boolean} - Returns true if the link has expired, false otherwise.
   */
  static hasExpired(link) {
    return DateService.isBeforeNow(link.expireAt);
  }
}

module.exports = LinkService;
