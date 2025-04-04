import { LocalUser } from "@/types/User";
import { dbOperations } from "@/lib/db";

export class UserStore {
  protected constructor() {}

  public static async getLocalUser(): Promise<LocalUser | null> {
    return await dbOperations.getLocalUser();
  }

  public static async updateLocalUser(user: LocalUser): Promise<LocalUser> {
    await this.clearUserStore();
    return await dbOperations.updateLocalUser(user);
  }

  public static async clearUserStore(): Promise<void> {
    await dbOperations.clearUserStore();
  }
}
