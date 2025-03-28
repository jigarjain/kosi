"use client";

import Link from "next/link";
import { useAppState } from "@/context/AppState";
import { getNextPageSlug, getPreviousPageSlug } from "@/lib/utils";

export default function Pagination() {
  const { currentPageSlug } = useAppState();
  const nextPage = getNextPageSlug(currentPageSlug);
  const previousPage = getPreviousPageSlug(currentPageSlug);
  const month = new Date(currentPageSlug).toLocaleString("default", {
    month: "short",
  });
  const day = new Date(currentPageSlug).toLocaleString("default", {
    day: "2-digit",
  });
  const year = new Date(currentPageSlug).toLocaleString("default", {
    year: "numeric",
  });

  return (
    <div className="grid grid-cols-3 items-center gap-4 px-4 py-2">
      <div className="flex justify-start">
        {previousPage && (
          <Link
            href={`/pages/${previousPage}`}
            className="btn btn-ghost"
            title="Show Previous Entry"
          >
            Previous Entry
          </Link>
        )}
      </div>
      <div className="text-center text-sm text-neutral flex items-center justify-center">
        {currentPageSlug && (
          <div className="flex flex-col items-center text-center">
            <div className="uppercase text-sm tracking-wider">{month}</div>
            <div className="countdown text-4xl font-bold leading-none">
              <span
                style={
                  {
                    ["--value" as string]: day,
                  } as React.CSSProperties
                }
              >
                {day}
              </span>
            </div>
            <div className="text-sm">{year}</div>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        {nextPage && (
          <Link
            href={`/pages/${nextPage}`}
            className="btn btn-ghost"
            title="Show Next Entry"
          >
            Next Entry
          </Link>
        )}
      </div>
    </div>
  );
}
