import Link from "next/link";

export default function Header() {
  return (
    <header className="p-[15px] border-0 border-base-300 bg-success">
      <Link
        href="/"
        className="text-xl font-semibold text-success-content uppercase"
      >
        Kosi
      </Link>
    </header>
  );
}
