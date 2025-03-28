"use client";

import { useCallback, useRef } from "react";
import { useAddEntry } from "@/hooks/api/entries";
import { useAppState } from "@/context/AppState";
import EntryInput from "@/components/EntryInput";
import Modal from "@/components/Modal";

export default function ActionsMenu() {
  const { currentPageSlug } = useAppState();
  const addNewEntryMutation = useAddEntry();
  const modalRef = useRef<HTMLDialogElement>(null);

  const onSubmit = useCallback(
    async (entry: string) => {
      await addNewEntryMutation.mutateAsync(
        {
          entryText: entry,
          pageSlug: currentPageSlug,
        },
        {
          onSuccess: () => {
            modalRef.current?.close();
          },
        }
      );
    },
    [addNewEntryMutation, currentPageSlug]
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
