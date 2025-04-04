import { useRef } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppState";
import { Auth } from "../Auth/Auth";
import Modal from "../Modal";

export default function Header() {
  const { currentUser, localAuth, handleLogout } = useAppState();

  const name = currentUser?.name;

  const modalRef = useRef<HTMLDialogElement>(null);
  const handleOnClick = () => {
    modalRef.current?.showModal();
  };
  const onAuthComplete = () => {
    modalRef.current?.close();
  };

  return (
    <>
      <header className="navbar border-0 border-base-300 bg-success">
        <div className="navbar-start">
          <Link
            href="/"
            className="text-xl font-semibold text-success-content uppercase"
          >
            Kosi
          </Link>
        </div>
        <div className="navbar-end">
          {localAuth ? (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-neutral btn-circle avatar"
              >
                {name ? name.charAt(0).toUpperCase() : "?"}
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
              >
                <li>
                  <a onClick={handleLogout}>Logout</a>
                </li>
              </ul>
            </div>
          ) : (
            <button className="btn btn-xs btn-accent" onClick={handleOnClick}>
              Sign In / Register
            </button>
          )}
        </div>
      </header>
      <Modal ref={modalRef}>
        <Auth onAuthComplete={onAuthComplete} />
      </Modal>
    </>
  );
}
