import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import jwt from "jsonwebtoken";
import { JWT_Payload } from "@/app/api/auth/auth.helper";

/**
 * Generates a cryptographically secure random salt
 */
export async function generateSalt(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(16)); // Generate a 16-byte salt
}

/**
 * Derives a master key from a password using PBKDF2
 * @param password - The user's plain text password
 * @param salt - The salt used for key derivation. Should be generated using generateSalt()
 */
export async function deriveMasterKey(
  password: string,
  salt: Uint8Array
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // High iteration count for security
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const keyData = await crypto.subtle.exportKey("raw", key);
  return new Uint8Array(keyData);
}

/**
 * Generates a new recovery phrase
 */
export function generateRecoveryPhrase(): string {
  return generateMnemonic(128);
}

/**
 * Derives a key from a recovery phrase
 * @param recoveryPhrase - The recovery phrase to derive the key from
 */
export async function deriveKeyFromRecoveryPhrase(
  recoveryPhrase: string
): Promise<Uint8Array> {
  const seed = mnemonicToSeedSync(recoveryPhrase);
  return Uint8Array.from(seed.subarray(0, 32));
}

/**
 * Generates a new Recovery Key (DEK)
 */
export async function generateRecoveryKey(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(32)); // 256-bit random key
}

export async function deriveAuthKey(
  masterKey: Uint8Array
): Promise<Uint8Array> {
  const key = await crypto.subtle.digest("SHA-256", masterKey);
  return new Uint8Array(key);
}

export async function generateHashedAuthKey(
  authKey: Uint8Array,
  salt: Uint8Array
): Promise<Uint8Array> {
  // Concatenate the arrays properly
  const combined = new Uint8Array(authKey.length + salt.length);
  combined.set(authKey, 0);
  combined.set(salt, authKey.length);

  const hashedAuthKey = await crypto.subtle.digest("SHA-256", combined);
  return new Uint8Array(hashedAuthKey);
}

/**
 * Generates a new Data Encryption Key (DEK)
 */
export async function generateDEK(): Promise<Uint8Array> {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const keyData = await crypto.subtle.exportKey("raw", key);
  return new Uint8Array(keyData);
}

/**
 * @internal
 */
async function encryptDEK(
  dek: Uint8Array,
  key: Uint8Array
): Promise<{ encryptedDEK: Uint8Array; ivForDek: Uint8Array }> {
  // Import the encryption key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const ivForDek = crypto.getRandomValues(new Uint8Array(12)); // Generate random IV

  const encryptedDEK = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ivForDek },
    cryptoKey,
    dek
  );

  return { encryptedDEK: new Uint8Array(encryptedDEK), ivForDek }; // IV is needed for decryption later
}

/**
 * @internal
 */
async function decryptDEK(
  encryptedDEK: Uint8Array,
  ivForDek: Uint8Array,
  key: Uint8Array
): Promise<Uint8Array> {
  // Import the decryption key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const dekRaw = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivForDek },
    cryptoKey,
    encryptedDEK
  );

  return new Uint8Array(dekRaw);
}

/**
 * Encrypts a DEK using a master key (wrapper function)
 * @param dek - The DEK to be encrypted (as Uint8Array)
 * @param masterKey - The master key used for encryption (as Uint8Array)
 */
export async function encryptDEKWithMK(
  dek: Uint8Array,
  masterKey: Uint8Array
): Promise<{ encryptedDEK: Uint8Array; ivForDek: Uint8Array }> {
  return encryptDEK(dek, masterKey);
}

/**
 * Decrypts a DEK using a master key (wrapper function)
 * @param encryptedDEK - The encrypted DEK to be decrypted
 * @param ivForDek - The initialization vector used for DEK encryption
 * @param masterKey - The master key used for decryption (as Uint8Array)
 */
export async function decryptDEKWithMK(
  encryptedDEK: Uint8Array,
  ivForDek: Uint8Array,
  masterKey: Uint8Array
): Promise<Uint8Array> {
  return decryptDEK(encryptedDEK, ivForDek, masterKey);
}

/**
 * Encrypts a DEK using a recovery key
 * @param dek - The DEK to be encrypted (as Uint8Array)
 * @param recoveryKey - The recovery key used for encryption (as Uint8Array)
 */
export async function encryptDEKWithRK(
  dek: Uint8Array,
  recoveryKey: Uint8Array
): Promise<{ encryptedDEK: Uint8Array; ivForDek: Uint8Array }> {
  return encryptDEK(dek, recoveryKey);
}

/**
 * Decrypts a DEK using a recovery key
 * @param encryptedDEK - The encrypted DEK to be decrypted
 * @param ivForDek - The initialization vector used for DEK encryption
 * @param recoveryKey - The recovery key used for decryption (as Uint8Array)
 */
export async function decryptDEKWithRK(
  encryptedDEK: Uint8Array,
  ivForDek: Uint8Array,
  recoveryKey: Uint8Array
): Promise<Uint8Array> {
  return decryptDEK(encryptedDEK, ivForDek, recoveryKey);
}

/**
 * Encrypts data using a DEK
 * @param data - The data to be encrypted
 * @param dek - The DEK used for encryption (as Uint8Array)
 */
export async function encryptData(
  data: string,
  dek: Uint8Array
): Promise<{ encryptedData: Uint8Array; iv: Uint8Array }> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate IV

  // Import the encryption key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    dek,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encoder.encode(data)
  );

  return { encryptedData: new Uint8Array(encryptedData), iv };
}

/**
 * Decrypts data using a DEK
 * @param encryptedData - The encrypted data to be decrypted
 * @param iv - The initialization vector used for encryption
 * @param dek - The DEK used for decryption (as Uint8Array)
 */
export async function decryptData(
  encryptedData: Uint8Array,
  iv: Uint8Array,
  dek: Uint8Array
): Promise<string> {
  // Import the decryption key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    dek,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encryptedData
  );

  return new TextDecoder().decode(decryptedData);
}

/**
 * Decodes a JWT token without verifying its signature
 * @param token - The JWT token string to decode
 * @returns The decoded JWT payload, or null if the token is invalid
 */
export function decodeJWT(token: string): JWT_Payload | null {
  const decoded = jwt.decode(token);

  if (!decoded || typeof decoded === "string") {
    return null;
  }

  if (decoded.exp && decoded.exp < Date.now() / 1000) {
    return null;
  }

  return decoded as JWT_Payload;
}
