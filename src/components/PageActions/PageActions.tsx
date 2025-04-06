"use client";

import { useCallback, useId, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DayPicker } from "react-day-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LocalEntry } from "@/types/Entry";
import { LocalPage } from "@/types/Page";
import { convertToPageDate, createNewEntry, createNewPage } from "@/lib/utils";
import { useAppState } from "@/context/AppState";
import Store from "@/store";
import EntryInput from "@/components/EntryInput";
import Modal from "@/components/Modal";

interface AddEntryParams {
  entryText: string;
  pageId: string;
}

export default function ActionsMenu() {
  const { currentPage, currentUser } = useAppState();
  const queryParams = useSearchParams();
  const queryClient = useQueryClient();
  const date = queryParams.get("date");
  const modalRef = useRef<HTMLDialogElement>(null);
  const calendarPopoverId = useId();
  const calendarPopoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const onDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        router.push(`/pages?date=${convertToPageDate(date)}`);
        calendarPopoverRef.current?.hidePopover();
      }
    },
    [router]
  );

  const addNewEntryMutation = useMutation<LocalEntry, Error, AddEntryParams>({
    mutationFn: async ({ entryText, pageId }: AddEntryParams) => {
      const entry = createNewEntry(entryText, pageId);
      return Store.addEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      modalRef.current?.close();
    }
  });

  const addNewPageMutation = useMutation<LocalPage, Error, LocalPage>({
    mutationFn: async (newPage: LocalPage) => {
      return Store.addPage(newPage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    }
  });

  const onSubmit = useCallback(
    async (entry: string) => {
      let newPage = currentPage;
      if (!newPage) {
        const tempPage = createNewPage(
          convertToPageDate(new Date(date!)),
          currentUser!.id
        );
        newPage = await addNewPageMutation.mutateAsync(tempPage);
      }

      addNewEntryMutation.mutate({
        entryText: entry,
        pageId: newPage!.id
      });
    },
    [addNewEntryMutation, addNewPageMutation, date, currentPage, currentUser]
  );

  return (
    <>
      <div className="fixed bottom-[30px] right-[30px]">
        <div className="flex flex-col gap-2">
          <button
            className="btn btn-info btn-circle"
            title="View Calendar"
            aria-label="View Calendar"
            popoverTarget={calendarPopoverId}
            style={{ anchorName: "--anchor-1" } as React.CSSProperties}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
          <button
            className="btn btn-success btn-circle"
            title="Add New Entry"
            aria-label="Add New Entry"
            onClick={() => {
              modalRef.current?.showModal();
            }}
          >
            <span className="text-2xl">&#43;</span>
          </button>
        </div>
      </div>
      <Modal ref={modalRef}>
        <EntryInput
          entryText=""
          onSubmit={onSubmit}
          isSubmitting={addNewEntryMutation.isPending}
          error={addNewEntryMutation.error}
          mode="add"
        />
      </Modal>
      <div
        ref={calendarPopoverRef}
        className="dropdown menu rounded-box bg-base-100 shadow-sm"
        popover="auto"
        id={calendarPopoverId}
        style={{ positionAnchor: "--anchor-1" } as React.CSSProperties}
      >
        <DayPicker
          className="react-day-picker"
          mode="single"
          selected={new Date(date!)}
          onSelect={onDateSelect}
          captionLayout="dropdown"
          showOutsideDays={true}
          disabled={{ after: new Date() }}
        />
      </div>
    </>
  );
}
