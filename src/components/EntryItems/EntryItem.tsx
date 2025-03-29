import { useRef } from "react";
import { useAppState } from "@/context/AppState";
import { useUpdateEntry } from "@/hooks/api/entries";
import { useDeleteEntry } from "@/hooks/api/entries";
import Entry from "@/types/Entry";
import Modal from "@/components/Modal";
import EntryInput from "@/components/EntryInput";
import EntryActions from "./EntryActions";

export default function EntryItem({ entry }: { entry: Entry }) {
  const { currentPageSlug } = useAppState();
  const deleteEntry = useDeleteEntry();
  const updateEntry = useUpdateEntry();
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleDelete = async () => {
    try {
      await deleteEntry.mutateAsync({
        entryId: entry.id,
        pageSlug: currentPageSlug
      });
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  const handleEdit = () => {
    modalRef.current?.showModal();
  };

  const handleUpdate = async (entryText: string) => {
    await updateEntry.mutateAsync({
      ...entry,
      content: entryText
    });

    modalRef.current?.close();
  };

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
