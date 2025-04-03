import { Base64URLString } from "./dto.types";

export interface LocalAuth {
  jwt: Base64URLString;
  dek: Uint8Array;
}
