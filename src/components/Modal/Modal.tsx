export default function Modal({
  ref,
  children
}: {
  ref: React.RefObject<HTMLDialogElement | null>;
  children: Readonly<React.ReactNode>;
}) {
  return (
    <dialog className="modal" ref={ref}>
      <div className="modal-box">{children}</div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
