import * as jose from "jose";

const KOSI_AUTH_SECRET = process.env.KOSI_AUTH_SECRET;
const ALGORITHM = "HS256";
const EXPIRY_TIME = "24h";

if (!KOSI_AUTH_SECRET) {
  throw new Error("KOSI_AUTH_SECRET is not set");
}

export const AUTH_USER_ID_HEADER = "X-Authorized-User-Id";

export type JWTUserPayload = {
  id: string;
  username: string;
  name: string;
  created_at: Date;
  updated_at: Date;
};

export const verifyJWT = async (
  token: string
): Promise<JWTUserPayload | null> => {
  try {
    // jose verify expects Uint8Array secret
    const secret = new TextEncoder().encode(KOSI_AUTH_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    // Convert payload dates if they are stored as numbers (seconds since epoch)
    return payload as JWTUserPayload;
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null;
  }
};

export const createJWT = async (payload: JWTUserPayload) => {
  const jwtPayload = {
    ...payload
  };

  // jose sign expects Uint8Array secret
  const secret = new TextEncoder().encode(KOSI_AUTH_SECRET);

  const jwtToken = await new jose.SignJWT(jwtPayload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setExpirationTime(EXPIRY_TIME)
    .sign(secret);

  return jwtToken;
};
