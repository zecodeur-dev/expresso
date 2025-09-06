const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const config = require("@/config");

/**
 * Service for sending campaigns mails and template mails
 */
class MailService {
  transporter;

  constructor({ mailerHost, mailerPort, mailerUser, mailerPwd }) {
    this.transporter = nodemailer.createTransport({
      host: mailerHost,
      port: mailerPort,
      secure: mailerPort == 465,
      auth: {
        user: mailerUser,
        pass: mailerPwd,
      },
      tls: {
        rejectUnauthorized: mailerPort == 465,
      },
    });
  }

  /**
   * Sends a plain text or HTML email to the specified recipients.
   *
   * @param {Object} params - The email parameters.
   * @param {Array<string>} params.to - An array of email addresses to send the email to.
   * @param {string} params.subject - The subject of the email.
   * @param {string} [params.text] - The plain text version of the email content.
   * @param {string} [params.html] - The HTML version of the email content.
   * @param {Mail.Attachment[]} [params.attachments] - Attachments files.
   */
  async sendMail({ to, subject, text, html, attachments }) {
    if (typeof to == "string") to = [to];

    const options = {
      from: '"' + config.mailerAppName + '" ' + config.mailerUser,
      to,
      subject,
      text,
      html,
      attachments,
    };
    return this.transporter.sendMail(options);
  }

  /**
   * Sends an email with a template by replacing placeholder variables in the HTML content.
   *
   * @param {Object} params - The email parameters.
   * @param {string} params.subject - The subject of the email.
   * @param {string} [params.template_path="index"] - The path to the template file (relative to the 'template' directory).
   * @param {Object} [params.template_var={}] - The variables to replace in the template (key-value pairs).
   * @param {Array<string>} [params.to=[]] - An array of email addresses to send the email to.
   * @param {Mail.Attachment[]} [params.attachments] - Attachments files.
   *
   */
  async sendTemplateMail({
    subject,
    template_path = "index",
    template_var = {},
    to = [],
    attachments,
  }) {
    try {
      if (!template_path.endsWith(".html")) template_path += ".html";

      var content = fs.readFileSync(
        path.join(__dirname,"templates", template_path),
        { encoding: "utf-8" }
      );

      for (let key of Object.keys(template_var)) {
        content = content.replaceAll(
          new RegExp(`#{${key}}`, "ig"),
          template_var[key]
        );
      }

      const info = await this.sendMail({
        to,
        subject,
        html: content,
        attachments,
      });
      return {
        sent: true,
        info,
      };
    } catch (error) {
      console.clear();
      console.log(error);
      return {
        sent: false,
        error,
      };
    }
  }

  /**
   * Validates if the provided string is a valid email address.
   *
   * @param {string} email - The email address to validate.
   * @returns {boolean} - Returns `true` if the email address is valid, `false` otherwise.
   */
  static isEmail(email) {
    const r = /\S+@\S+\.\S+/;
    return r.test(email);
  }

  static _default = new MailService(config);
  static sendMail({ to, subject, text, html, attachments }) {
    return MailService._default.sendMail({
      to,
      subject,
      text,
      html,
      attachments,
    });
  }

  static sendTemplateMail({
    subject,
    template_path,
    template_var,
    to,
    attachments,
  }) {
    return MailService._default.sendTemplateMail({
      subject,
      template_path,
      template_var,
      to,
      attachments,
    });
  }
}

module.exports = MailService;
