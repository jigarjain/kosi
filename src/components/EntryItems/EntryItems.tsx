"use client";

import { useAppState } from "@/context/AppState";
import { useEntriesByPageSlug } from "@/hooks/api/entries";
import EntryItem from "./EntryItem";

function NoEntries() {
  return <div className="text-center text-sm text-neutral">No entries</div>;
}

export default function EntryItems() {
  const { currentPageSlug } = useAppState();
  const { data: entries } = useEntriesByPageSlug(currentPageSlug);

  if (entries.length === 0) {
    return <NoEntries />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4 py-4 max-w-[1024px] mx-auto">
      {entries.map((entry) => (
        <EntryItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
