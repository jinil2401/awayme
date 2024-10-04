import CryptoJS from "crypto-js";
const secret = process.env.CRYPTO_SECRET as string;

export function encrypt(value: string) {
  const ciphertext = CryptoJS.AES.encrypt(value, secret).toString();
  return ciphertext;
}

export function decrypt(ciphertext: string) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
  const value = bytes.toString(CryptoJS.enc.Utf8);
  return value;
}
