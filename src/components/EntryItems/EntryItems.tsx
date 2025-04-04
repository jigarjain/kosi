"use client";

import { useQuery } from "@tanstack/react-query";
import { LocalEntry } from "@/types/Entry";
import { useAppState } from "@/context/AppState";
import Store from "@/store";
import EntryItem from "./EntryItem";

function NoEntries() {
  return (
    <div className="flex items-center justify-center h-full min-h-[500px] text-center text-sm">
      No entries yet
    </div>
  );
}

export default function EntryItems() {
  const { currentPage } = useAppState();

  const { data: entries, isPending } = useQuery<LocalEntry[]>({
    queryKey: ["entries", "byPage", currentPage?.id],
    queryFn: async () => Store.getEntriesByPage(currentPage!.id),
    enabled: !!currentPage
  });

  if (!isPending && entries?.length === 0) {
    return <NoEntries />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4 py-4 max-w-[1024px] mx-auto">
      {entries?.map((entry) => <EntryItem key={entry.id} entry={entry} />)}
    </div>
  );
}
