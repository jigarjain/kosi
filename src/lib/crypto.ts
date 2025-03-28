/**
 * Generates a cryptographically secure random salt
 */
async function generateSalt(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(16)); // Generate a 16-byte salt
}

/**
 * Derives a master key from a password using PBKDF2
 * @param password - The user's plain text password
 * @param salt - The salt used for key derivation. Should be generated using generateSalt()
 */
async function deriveMasterKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // High iteration count for security
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Generates a new Data Encryption Key (DEK)
 */
async function generateDEK(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * @deprecated Use encryptDEKWithMK or encryptDEKWithRK instead. This function should not be called directly.
 * Encrypts a Data Encryption Key (DEK) using another key.
 * @param dek - The DEK to be encrypted
 * @param key - The key used to encrypt the DEK
 */
async function encryptDEK(
  dek: CryptoKey,
  key: CryptoKey
): Promise<{ encryptedDEK: ArrayBuffer; ivForDek: Uint8Array }> {
  const dekRaw = await crypto.subtle.exportKey("raw", dek); // Convert DEK to raw bytes
  const ivForDek = crypto.getRandomValues(new Uint8Array(12)); // Generate random IV

  const encryptedDEK = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ivForDek },
    key,
    dekRaw
  );

  return { encryptedDEK, ivForDek }; // IV is needed for decryption later
}

/**
 * @deprecated Use decryptDEKWithMK or decryptDEKWithRK instead. This function should not be called directly.
 * Decrypts an encrypted DEK using a master key.
 * @param encryptedDEK - The encrypted DEK to be decrypted
 * @param ivForDek - The initialization vector used for DEK encryption
 * @param key - The key used to decrypt the DEK
 */
async function decryptDEK(
  encryptedDEK: ArrayBuffer,
  ivForDek: Uint8Array,
  key: CryptoKey
): Promise<CryptoKey> {
  const dekRaw = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivForDek },
    key,
    encryptedDEK
  );

  return await crypto.subtle.importKey(
    "raw",
    dekRaw,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a DEK using a master key (wrapper function)
 * @param dek - The DEK to be encrypted
 * @param masterKey - The master key used for encryption
 */
async function encryptDEKWithMK(
  dek: CryptoKey,
  masterKey: CryptoKey
): Promise<{ encryptedDEK: ArrayBuffer; ivForDek: Uint8Array }> {
  return encryptDEK(dek, masterKey);
}

/**
 * Decrypts a DEK using a master key (wrapper function)
 * @param encryptedDEK - The encrypted DEK to be decrypted
 * @param ivForDek - The initialization vector used for DEK encryption
 * @param masterKey - The master key used for decryption
 */
async function decryptDEKWithMK(
  encryptedDEK: ArrayBuffer,
  ivForDek: Uint8Array,
  masterKey: CryptoKey
): Promise<CryptoKey> {
  return decryptDEK(encryptedDEK, ivForDek, masterKey);
}

/**
 * Encrypts a DEK using a recovery key
 * @param dek - The DEK to be encrypted
 * @param recoveryKey - The recovery key used for encryption
 */
async function encryptDEKWithRK(
  dek: CryptoKey,
  recoveryKey: CryptoKey
): Promise<{ encryptedDEK: ArrayBuffer; ivForDek: Uint8Array }> {
  return encryptDEK(dek, recoveryKey);
}

/**
 * Decrypts a DEK using a recovery key
 * @param encryptedDEK - The encrypted DEK to be decrypted
 * @param ivForDek - The initialization vector used for DEK encryption
 * @param recoveryKey - The recovery key used for decryption
 */
async function decryptDEKWithRK(
  encryptedDEK: ArrayBuffer,
  ivForDek: Uint8Array,
  recoveryKey: CryptoKey
): Promise<CryptoKey> {
  return decryptDEK(encryptedDEK, ivForDek, recoveryKey);
}

/**
 * Encrypts data using a DEK
 * @param data - The data to be encrypted
 * @param dek - The DEK used for encryption
 */
async function encryptData(
  data: string,
  dek: CryptoKey
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate IV

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    dek,
    encoder.encode(data)
  );

  return { encryptedData, iv };
}

/**
 * Decrypts data using a DEK
 * @param encryptedData - The encrypted data to be decrypted
 * @param iv - The initialization vector used for encryption
 * @param dek - The DEK used for decryption
 */
async function decryptData(
  encryptedData: ArrayBuffer,
  iv: Uint8Array,
  dek: CryptoKey
): Promise<string> {
  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    dek,
    encryptedData
  );

  return new TextDecoder().decode(decryptedData);
}
