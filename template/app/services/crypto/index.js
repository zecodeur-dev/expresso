const CryptoJS = require("crypto-js");
const config = require("@/config");

class CrytoService {
  static secretKey = config.cryptoSecret;

  static checkScretKey() {
    if (!CrytoService.secretKey) throw new Error("Crypto key not found");
  }

  static encrypt(plainText) {
    CrytoService.checkScretKey();
    const encrypted = CryptoJS.AES.encrypt(
      plainText,
      CrytoService.secretKey
    ).toString();
    return encrypted;
  }

  static decrypt(encryptedText) {
    CrytoService.checkScretKey();
    const bytes = CryptoJS.AES.decrypt(encryptedText, CrytoService.secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  }
}

module.exports = CrytoService;
