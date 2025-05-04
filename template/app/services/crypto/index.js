const CryptoJS = require("crypto-js");
const config = require("@/config");

class CryptoService {
  static secretKey = config.cryptoSecret;

  static checkScretKey() {
    if (!CryptoService.secretKey) throw new Error("Crypto key not found");
  }

  static encrypt(plainText) {
    CryptoService.checkScretKey();
    if (!plainText) return;
    const encrypted = CryptoJS.AES.encrypt(
      plainText.toString(),
      CryptoService.secretKey
    ).toString();
    return encrypted;
  }

  static decrypt(encryptedText) {
    CryptoService.checkScretKey();
    if (!encryptedText) return;
    const bytes = CryptoJS.AES.decrypt(encryptedText, CryptoService.secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  }
}

module.exports = CryptoService;
  