import { keySalt } from "@/encrypt/config.ts";

const encoder = new TextEncoder();

export const getKeyMaterial = (password: string) =>
  crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    {
      name: "PBKDF2",
    },
    false,
    ["deriveBits"],
  );

export const getPrivateBits = (keyMaterial: CryptoKey) =>
  crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-512",
      salt: keySalt.buffer,
      iterations: 210000, // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
    },
    keyMaterial,
    256, // 32 bytes
  );
