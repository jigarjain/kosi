export interface User {
  id: string;
  name: string;
  username: string;
  encrypted_dek_mk: string;
  iv_mk: string;
  encrypted_dek_rk: string;
  iv_rk: string;
  password_salt: string;
  hashed_authkey: string;
  authkey_salt: string;
  created_at: Date;
  updated_at: Date;
}

export interface LocalUser {
  id: User["id"];
  name: User["name"];
  username: User["username"];
  created_at: User["created_at"];
  updated_at: User["updated_at"];
}
