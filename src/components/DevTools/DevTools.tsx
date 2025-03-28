import { loadEntriesAndPages } from "@/lib/dev";

export default function DevTools() {
  return (
    <div className="fixed bottom-[70px] left-[20px] flex flex-col justify-between items-center gap-2">
      <button
        className="btn btn-warning btn-circle btn-sm"
        name="Add new Entry"
        onClick={loadEntriesAndPages}
      >
        <span className="text-2xl">&#9881;</span>
      </button>
    </div>
  );
}
