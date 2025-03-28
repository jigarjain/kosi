interface EntryInputProps {
  mode: "add" | "edit";
  onSubmit: (entryText: string) => Promise<void>;
  isSubmitting: boolean;
  entryText: string;
  error: Error | null;
}

export default function EntryInput(props: EntryInputProps) {
  const { entryText, onSubmit, isSubmitting, error, mode } = props;
  let btnText = "Add to Journal";
  let btnLoadingText = "Adding...";

  if (mode === "edit") {
    btnText = "Update";
    btnLoadingText = "Updating...";
  }

  async function handleSubmit(formData: FormData) {
    const entryText = formData.get("entryText") as string;
    if (entryText && entryText.trim() !== "") {
      await onSubmit(entryText);
    }
  }

  return (
    <form action={handleSubmit}>
      {error && (
        <div role="alert" className="alert alert-error text-sm mb-2">
          {error.message}
        </div>
      )}
      <textarea
        name="entryText"
        defaultValue={entryText}
        className="textarea textarea-md textarea-accent no focus:outline-none border-accent border w-full"
        placeholder="What's on your mind?"
        disabled={isSubmitting}
        aria-required="true"
        aria-disabled={isSubmitting}
        required
        rows={4}
      />
      <div className="modal-action">
        <button
          type="submit"
          className="btn bg-accent text-accent-content border-0 justify-end"
          title={btnText}
          aria-label={btnText}
        >
          {isSubmitting ? btnLoadingText : btnText}
        </button>
      </div>
    </form>
  );
}
