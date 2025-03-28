import Entry from "./Entry";

export default interface Page {
  id: string;
  slug: string;
  entries: Entry["id"][];
  createdAt: Date;
  updatedAt: Date;
}
