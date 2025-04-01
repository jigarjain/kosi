import { LocalUser } from "@/types/User";
import { getDB, USERS_STORE } from "./db";

export async function setupLocalDB(): Promise<LocalUser> {
  let localUser = await getLocalUser();

  if (!localUser) {
    console.debug("Creating local user");
    localUser = await createLocalUser();
  }

  return localUser;
}

async function createLocalUser(): Promise<LocalUser> {
  const user = {
    id: crypto.randomUUID(),
    name: "Elorin",
    created_at: new Date(),
    updated_at: new Date(),
    is_local: true
  };

  const db = await getDB();
  await db.put(USERS_STORE, user);

  return user;
}

async function getLocalUser(): Promise<LocalUser | undefined> {
  const db = await getDB();
  const result = await db.getAll(USERS_STORE);

  return result[0];
}
