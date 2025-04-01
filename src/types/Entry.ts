import { Page } from "./Page";

export interface Entry {
  id: string;
  page_id: Page["id"];
  content: string;
  iv: string;
  created_at: Date;
  updated_at: Date;
}

export interface LocalEntry {
  id: Entry["id"];
  page_id: Entry["page_id"];
  content: Entry["content"];
  iv?: Entry["iv"];
  created_at: Entry["created_at"];
  updated_at: Entry["updated_at"];
}
