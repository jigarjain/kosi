"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getNextPageDateString, getPreviousPageDateString } from "@/lib/utils";

export default function Pagination() {
  const date = useSearchParams().get("date");
  const currentDate = new Date(date || "");

  const nextPage = getNextPageDateString(currentDate);
  const previousPage = getPreviousPageDateString(currentDate);
  const month = new Date(currentDate).toLocaleString("default", {
    month: "short"
  });
  const day = new Date(currentDate).toLocaleString("default", {
    day: "2-digit"
  });
  const year = new Date(currentDate).toLocaleString("default", {
    year: "numeric"
  });

  return (
    <div className="grid grid-cols-3 items-center gap-4 px-4">
      <div className="flex justify-start">
        {previousPage && (
          <Link
            href={`/pages?date=${previousPage}`}
            className="btn btn-ghost"
            title="Show Previous Page"
          >
            Previous Page
          </Link>
        )}
      </div>
      <div className="text-center text-sm text-neutral flex items-center justify-center">
        <div className="flex items-center font-bold text-center">
          <div className="uppercase text-sm tracking-wider">{month}</div>
          <div className="countdown text-4xl font-bold leading-none px-2">
            <span
              style={
                {
                  ["--value" as string]: day
                } as React.CSSProperties
              }
            >
              {day}
            </span>
          </div>
          <div className="text-sm">{year}</div>
        </div>
      </div>
      <div className="flex justify-end">
        {nextPage && (
          <Link
            href={`/pages?date=${nextPage}`}
            className="btn btn-ghost"
            title="Show Next Page"
          >
            Next Page
          </Link>
        )}
      </div>
    </div>
  );
}
