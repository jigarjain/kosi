"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LocalPage } from "@/types/Page";
import { convertToPageDate } from "@/lib/utils";
import { useAppState } from "@/context/AppState";
import Store from "@/store";
import EntryItems from "@/components/EntryItems";
import PageActions from "@/components/PageActions";
import Pagination from "@/components/Pagination";

export default function Page() {
  const router = useRouter();
  const { setCurrentPage } = useAppState();
  const queryParams = useSearchParams();
  const date = queryParams.get("date");

  const getPageQuery = useQuery<LocalPage | null>({
    queryKey: ["pages", date],
    queryFn: async () => Store.getPageByDate(date!),
    enabled: !!date && date.trim().length > 0
  });

  useEffect(() => {
    // If no date is provided, redirect to today's page
    if (!date) {
      const today = new Date();
      const todaySlug = convertToPageDate(today);
      router.push(`/pages?date=${todaySlug}`);
    }
  }, [date, router]);

  useEffect(() => {
    // If the date is provided, set the current page to the page with that date
    if (getPageQuery.isSuccess) {
      setCurrentPage(getPageQuery.data || null);
    }
  }, [getPageQuery.isSuccess, getPageQuery.data, setCurrentPage]);

  return (
    <>
      <Pagination />
      <EntryItems />
      <PageActions />
    </>
  );
}
