import { AES } from "crypto-js";
import UTF8 from "crypto-js/enc-utf8.js";
import CryptoJS from "crypto-js";
import md5 from "crypto-js/md5.js";
import Base64 from "crypto-js/enc-base64.js";
import forge from "node-forge";
export interface EncryptionParams {
  serverPublicKey: string;
}

export class AesEncryption {
  private iv;
  private key;
  rsaEncrypt;

  constructor(opt: Partial<EncryptionParams> = {}) {
    const { serverPublicKey } = opt;
    const aesKey = forge.random.getBytesSync(32);

    if (serverPublicKey) {
      const publicKey = forge.pki.publicKeyFromPem(serverPublicKey);
      this.rsaEncrypt = publicKey.encrypt(aesKey, "RSA-OAEP", {
        md: forge.md.sha256.create(),
      });
      this.key = CryptoJS.enc.Base64.parse(forge.util.encode64(aesKey));
      this.iv = CryptoJS.enc.Utf8.parse("1234567890abcdef");
    } else {
      throw new Error("Unsupported encryption key");
    }
  }
  get getKey() {
    try {
      return forge.util.encode64(this.rsaEncrypt);
    } catch (e) {
      console.log(e);
    }
  }
  get getIv() {
    return this.iv.toString(CryptoJS.enc.Base64);
  }
  get getOptions() {
    return {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: this.iv,
    };
  }
  // AES 加密
  encryptByAES(cipherText: string) {
    return AES.encrypt(cipherText, this.key || "", this.getOptions).toString();
  }

  // AES 解密
  decryptByAES(cipherText: string, isBase64: boolean = false) {
    const decrypt = AES.decrypt(
      isBase64 ? atob(cipherText) : cipherText,
      this.key || "",
      this.getOptions,
    );
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
  }
}

export function encryptByBase64(cipherText: string) {
  return UTF8.parse(cipherText).toString(Base64);
}

export function decodeByBase64(cipherText: string) {
  return Base64.parse(cipherText).toString(UTF8);
}

export function encryptByMd5(password: string) {
  return md5(password).toString();
}
