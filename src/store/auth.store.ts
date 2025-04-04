import { AxiosResponse } from "axios";
import { LocalAuth } from "@/types/Auth";
import { LocalUser } from "@/types/User";
import {
  CreateSessionRequestDto,
  CreateSessionResponseDto,
  CreateUserRequestDto,
  CreateUserResponseDto,
  GetAuthResponseDto
} from "@/types/dto.types";
import { apiClient } from "@/lib/api.client";
import {
  decodeJWT,
  decryptDEKWithMK,
  deriveAuthKey,
  deriveKeyFromRecoveryPhrase,
  deriveMasterKey,
  encryptDEKWithMK,
  encryptDEKWithRK,
  generateDEK,
  generateHashedAuthKey,
  generateRecoveryPhrase,
  generateSalt
} from "@/lib/crypto";
import { dbOperations } from "@/lib/db";
import { base64ToUint8Array, uint8ArrayToBase64 } from "@/lib/utils";
import { UserStore } from "./user.store";

export class AuthStore {
  protected constructor() {}

  public static async registerUser(
    name: string,
    username: string,
    password: string
  ): Promise<{ recoveryPhrase: string; user_id: string }> {
    let createUserBody: CreateUserRequestDto;
    let recoveryPhrase: string;

    try {
      // Create Master Key
      const passwordSalt = await generateSalt();
      const masterKey = await deriveMasterKey(password, passwordSalt);

      // Create Recovery Key
      recoveryPhrase = generateRecoveryPhrase();
      const recoveryKey = await deriveKeyFromRecoveryPhrase(recoveryPhrase);

      // Create Data Encryption Keys
      const dek = await generateDEK();
      const { encryptedDEK: encryptedDekMk, ivForDek: ivMk } =
        await encryptDEKWithMK(dek, masterKey);
      const { encryptedDEK: encryptedDekRk, ivForDek: ivRk } =
        await encryptDEKWithRK(dek, recoveryKey);

      // Create Auth Key
      const authKeySalt = await generateSalt();
      const authKey = await deriveAuthKey(masterKey);
      const hashedAuthKey = await generateHashedAuthKey(authKey, authKeySalt);

      createUserBody = {
        name: name,
        username: username,
        password_salt: uint8ArrayToBase64(passwordSalt),
        encrypted_dek_mk: uint8ArrayToBase64(encryptedDekMk),
        iv_mk: uint8ArrayToBase64(ivMk),
        encrypted_dek_rk: uint8ArrayToBase64(encryptedDekRk),
        iv_rk: uint8ArrayToBase64(ivRk),
        hashed_authkey: uint8ArrayToBase64(hashedAuthKey),
        authkey_salt: uint8ArrayToBase64(authKeySalt)
      };
    } catch (e) {
      throw e;
    }

    let response: AxiosResponse<CreateUserResponseDto>;
    try {
      response = await apiClient.post<
        CreateUserRequestDto,
        AxiosResponse<CreateUserResponseDto>
      >("/users", createUserBody);
    } catch (error) {
      console.error("Error posting to /users:", error);
      throw new Error(
        "Failed to register user: " +
          (error instanceof Error ? error.message : error)
      );
    }

    if (response.status !== 201) {
      throw new Error(
        "Failed to register user: Unexpected status " + response.status
      );
    }

    try {
      const { id } = response.data;
      return {
        recoveryPhrase,
        user_id: id
      };
    } catch (error) {
      console.error("Error processing registration response:", error);
      throw new Error(
        "Failed to process registration response: " +
          (error instanceof Error ? error.message : error)
      );
    }
  }

  public static async getAuth(
    username: string,
    password: string
  ): Promise<{ localAuth: LocalAuth | null; localUser: LocalUser | null }> {
    let response: AxiosResponse<GetAuthResponseDto>;
    let sessionRequest: CreateSessionRequestDto;

    try {
      response = await apiClient.get<GetAuthResponseDto>(
        `/auth?username=${username}`
      );
    } catch (error) {
      console.error("Error fetching auth details:", error);
      throw new Error("Failed to fetch user auth details");
    }

    if (response.status !== 200) {
      throw new Error("Failed to fetch user auth details");
    }

    let dek: Uint8Array;

    try {
      const authDetails = {
        id: response.data.id,
        encrypted_dek_mk: base64ToUint8Array(response.data.encrypted_dek_mk),
        iv_mk: base64ToUint8Array(response.data.iv_mk),
        password_salt: base64ToUint8Array(response.data.password_salt),
        authkey_salt: base64ToUint8Array(response.data.authkey_salt)
      };

      const mk = await deriveMasterKey(password, authDetails.password_salt);

      dek = await decryptDEKWithMK(
        authDetails.encrypted_dek_mk,
        authDetails.iv_mk,
        mk
      );

      // Generate hashed auth key
      const authKey = await deriveAuthKey(mk);
      const hashedAuthKey = await generateHashedAuthKey(
        authKey,
        authDetails.authkey_salt
      );

      sessionRequest = {
        id: authDetails.id,
        hashed_authkey: uint8ArrayToBase64(hashedAuthKey)
      };
    } catch (error) {
      console.error("Error decrypting keys with given password:", error);
      throw new Error(
        "Error decrypting your Encryption Keys with given password"
      );
    }

    let sessionResponse: AxiosResponse<CreateSessionResponseDto>;

    try {
      sessionResponse = await apiClient.post<
        CreateSessionRequestDto,
        AxiosResponse<CreateSessionResponseDto>
      >("/auth", sessionRequest);
    } catch (error) {
      console.error("Error fetching token:", error);
      throw new Error("Failed to create session");
    }

    if (response.status !== 200) {
      throw new Error("Failed to fetch user auth details");
    }

    const localAuth: LocalAuth = {
      jwt: sessionResponse.data.jwt_token,
      dek
    };

    const localUser = decodeJWT(localAuth.jwt)!;

    await Promise.all([
      this.updateLocalAuth(localAuth),
      UserStore.updateLocalUser(localUser)
    ]);

    return { localAuth, localUser };
  }

  public static async updateLocalAuth(auth: LocalAuth): Promise<void> {
    const data = {
      jwt: auth.jwt,
      dek: uint8ArrayToBase64(auth.dek)
    };

    await this.clearAuthStore();
    await dbOperations.storeLocalAuth(data);
  }

  public static async getLocalAuth(): Promise<LocalAuth | null> {
    const localAuth = (await dbOperations.getLocalAuth()) as Record<
      string,
      string
    >;
    if (!localAuth || !localAuth.jwt || !localAuth.dek) return null;

    const decodedJWT = decodeJWT(localAuth.jwt);

    if (!decodedJWT) {
      await this.clearAuthStore();
      return null;
    }

    return {
      jwt: localAuth.jwt as Base64URLString,
      dek: base64ToUint8Array(localAuth.dek)
    };
  }

  public static async clearAuthStore(): Promise<void> {
    await dbOperations.clearAuthStore();
  }
}
