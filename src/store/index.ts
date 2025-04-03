import { AxiosResponse } from "axios";
import { LocalAuth } from "@/types/Auth";
import { LocalEntry } from "@/types/Entry";
import { LocalPage, Page } from "@/types/Page";
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

class Store {
  private constructor() {}

  public static async setupLocalDB(): Promise<void> {
    console.debug("[Store] setupLocalDB");
    let localUser = await dbOperations.getLocalUser();

    if (!localUser) {
      localUser = {
        id: crypto.randomUUID(),
        name: "Elorin",
        username: "elorin",
        created_at: new Date(),
        updated_at: new Date()
      };

      await dbOperations.updateLocalUser(localUser);
    }
  }

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

    console.log(localAuth);
    const localUser = decodeJWT(localAuth.jwt)!;
    console.log(localUser);

    await Promise.all([
      this.updateLocalAuth(localAuth),
      this.updateLocalUser(localUser)
    ]);

    return { localAuth, localUser };
  }

  public static async getPageByDate(date: string): Promise<Page | null> {
    console.debug("[Store] getPageByDate", date);
    return dbOperations.getPageByDate(date);
  }

  public static async addPage(page: LocalPage): Promise<LocalPage> {
    console.debug("[Store] addPage", page);
    return dbOperations.addPage(page);
  }

  public static async getEntriesByPage(pageId: string): Promise<LocalEntry[]> {
    console.debug("[Store] getEntriesByPage", pageId);
    return dbOperations.getEntriesByPageId(pageId);
  }

  public static async addEntry(entry: LocalEntry): Promise<LocalEntry> {
    console.debug("[Store] addEntry", entry);
    return dbOperations.addEntry(entry);
  }

  public static async updateEntry(entry: LocalEntry): Promise<LocalEntry> {
    console.debug("[Store] updateEntry", entry);
    return dbOperations.updateEntry(entry);
  }

  public static async deleteEntry(entryId: string): Promise<void> {
    console.debug("[Store] deleteEntry", entryId);
    return dbOperations.deleteEntry(entryId);
  }

  public static async getLocalAuth(): Promise<LocalAuth | null> {
    const data = (await dbOperations.getLocalAuth()) as {
      jwt: Base64URLString;
      dek: string;
    };

    // verify if the jwt is expired
    if (data && data.jwt) {
      const decodedJwt = decodeJWT(data.jwt);

      if (decodedJwt) {
        return {
          jwt: data.jwt,
          dek: base64ToUint8Array(data.dek)
        };
      } else {
        await this.deleteLocalAuth();
        await this.deleteLocalUser();
        return null;
      }
    }

    return null;
  }

  public static async updateLocalAuth(localAuth: LocalAuth): Promise<void> {
    const data = {
      jwt: localAuth.jwt,
      dek: uint8ArrayToBase64(localAuth.dek)
    };
    console.log("updateLocalAuth", data);
    await dbOperations.storeLocalAuth(data);
    console.log("updatedLocalAuth", "success");
  }

  public static async deleteLocalAuth(): Promise<void> {
    await dbOperations.deleteLocalAuth();
  }

  public static async getLocalUser(): Promise<LocalUser | null> {
    return dbOperations.getLocalUser();
  }

  public static async updateLocalUser(user: LocalUser): Promise<void> {
    console.log("updateLocalUser", user);
    await dbOperations.updateLocalUser(user);
    console.log("updatedLocalUser", "success");
  }

  public static async deleteLocalUser(): Promise<void> {
    await dbOperations.deleteLocalUser();
  }
}

export default Store;
