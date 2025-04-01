import { User } from "./User";

export interface Page {
  id: string;
  user_id: User["id"];
  created_at: Date;
  updated_at: Date;
}

export interface LocalPage {
  id: Page["id"];
  user_id: Page["user_id"];
  created_at: Page["created_at"];
  updated_at: Page["updated_at"];
}
