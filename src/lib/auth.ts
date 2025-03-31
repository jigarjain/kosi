import jwt from "jsonwebtoken";

const KOSI_AUTH_SECRET = process.env.KOSI_AUTH_SECRET;
const ALGORITHM = "HS256";
const EXPIRY_TIME = "30m";

if (!KOSI_AUTH_SECRET) {
  throw new Error("KOSI_AUTH_SECRET is not set");
}

export type JWT_Payload = {
  user_id: string;
};

export const verifyJWT = (token: string) => {
  const decoded = jwt.verify(token, KOSI_AUTH_SECRET, {
    algorithms: [ALGORITHM]
  });
  return decoded;
};

export const createJWT = (payload: JWT_Payload) => {
  const jwtPayload = {
    ...payload
  };

  const jwtToken = jwt.sign(jwtPayload, KOSI_AUTH_SECRET, {
    algorithm: ALGORITHM,
    expiresIn: EXPIRY_TIME
  });

  return jwtToken;
};
