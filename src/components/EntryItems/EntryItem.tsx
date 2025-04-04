import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LocalEntry } from "@/types/Entry";
import Store from "@/store";
import EntryInput from "@/components/EntryInput";
import Modal from "@/components/Modal";
import EntryActions from "./EntryActions";

interface DeleteEntryParams {
  pageId: string;
  entryId: string;
}

export default function EntryItem({ entry }: { entry: LocalEntry }) {
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDialogElement>(null);

  const deleteEntry = useMutation<void, Error, DeleteEntryParams>({
    mutationFn: async ({ pageId, entryId }: DeleteEntryParams) => {
      return Store.deleteEntry(pageId, entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
    onError: (error) => {
      console.error("Failed to delete entry:", error);
    }
  });

  const updateEntry = useMutation<LocalEntry, Error, LocalEntry>({
    mutationFn: async (entry: LocalEntry) => {
      const updatedEntry = {
        ...entry,
        updated_at: new Date()
      };
      return Store.updateEntry(updatedEntry);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["entries", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["entries", "byPageId", variables.page_id]
      });

      modalRef.current?.close();
    },
    onError: (error) => {
      console.error("Failed to update entry:", error);
    }
  });

  const handleDelete = useCallback(async () => {
    deleteEntry.mutate({
      pageId: entry.page_id,
      entryId: entry.id
    });
  }, [deleteEntry, entry.id, entry.page_id]);

  const handleEdit = () => {
    modalRef.current?.showModal();
  };

  const handleUpdate = useCallback(
    async (entryText: string) => {
      updateEntry.mutate({
        ...entry,
        content: entryText
      });
    },
    [updateEntry, entry]
  );

  return (
    <>
      <div className="card card-border border-base-300 bg-base-200 w-full group">
        <div className="card- gap-0 justify-end absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <EntryActions
            onDelete={handleDelete}
            onEdit={handleEdit}
            isDeleting={deleteEntry.isPending}
          />
        </div>
        <div className="card-body pt-8">
          <p>{entry.content}</p>
        </div>
      </div>

      <Modal ref={modalRef}>
        <EntryInput
          entryText={entry.content}
          onSubmit={handleUpdate}
          isSubmitting={updateEntry.isPending}
          error={updateEntry.error}
          mode="edit"
        />
      </Modal>
    </>
  );
}
