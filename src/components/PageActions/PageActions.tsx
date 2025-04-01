"use client";

import { useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppState } from "@/context/AppState";
import EntryInput from "@/components/EntryInput";
import Modal from "@/components/Modal";
import { convertToPageDate, createNewEntry, createNewPage } from "@/lib/utils";
import { LocalEntry } from "@/types/Entry";
import { LocalPage } from "@/types/Page";
import Store from "@/store";

interface AddEntryParams {
  entryText: string;
  pageId: string;
}

export default function ActionsMenu() {
  const { currentPage, currentUser } = useAppState();
  const queryParams = useSearchParams();
  const queryClient = useQueryClient();
  const date = queryParams.get("date");

  const addNewEntryMutation = useMutation<LocalEntry, Error, AddEntryParams>({
    mutationFn: async ({ entryText, pageId }: AddEntryParams) => {
      const entry = createNewEntry(entryText, pageId);
      return Store.addEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
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

  const modalRef = useRef<HTMLDialogElement>(null);

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

      await addNewEntryMutation.mutateAsync(
        {
          entryText: entry,
          pageId: newPage!.id
        },
        {
          onSuccess: () => {
            modalRef.current?.close();
          }
        }
      );
    },
    [addNewEntryMutation, addNewPageMutation, date, currentPage, currentUser]
  );

  return (
    <>
      <div className="fixed bottom-[30px] right-[30px]">
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
      <Modal ref={modalRef}>
        <EntryInput
          entryText=""
          onSubmit={onSubmit}
          isSubmitting={addNewEntryMutation.isPending}
          error={addNewEntryMutation.error}
          mode="add"
        />
      </Modal>
    </>
  );
}
