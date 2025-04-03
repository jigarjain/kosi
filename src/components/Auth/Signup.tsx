type Props = {
  handleScreenChange: () => void;
  handleSubmit: (data: FormData) => Promise<void>;
};

export default function Signup(props: Props) {
  const { handleScreenChange, handleSubmit } = props;
  return (
    <form action={handleSubmit}>
      <div className="card card-sm overflow-hidden">
        <div className="border-base-300 border-b border-dashed">
          <div className="flex items-center gap-2 p-4">
            <div className="grow">
              <div className="flex items-center gap-2 text-sm font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-5 opacity-40"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                  ></path>
                </svg>{" "}
                Create new account to sync your data
              </div>
            </div>
          </div>
        </div>{" "}
        <div className="card-body gap-4">
          <div className="flex flex-col gap-1">
            <label className="input input-border flex max-w-none items-center gap-2 no focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"></path>
              </svg>{" "}
              <input
                type="text"
                className="grow"
                placeholder="Your Name"
                name="name"
                required
              />
            </label>
          </div>{" "}
          <div className="flex flex-col gap-1">
            <label className="input input-border flex max-w-none items-center gap-2  no focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"></path>
              </svg>{" "}
              <input
                type="text"
                className="grow"
                placeholder="Username"
                name="username"
                required
              />
            </label>
          </div>{" "}
          <div className="flex flex-col gap-1">
            <label className="input input-border flex max-w-none items-center gap-2 no focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                  clipRule="evenodd"
                ></path>
              </svg>{" "}
              <input
                type="password"
                className="grow"
                placeholder="Password"
                name="password"
                required
              />
            </label>{" "}
            <span className="text-base-content/60 flex items-center gap-2 px-1 text-[0.6875rem]">
              <span className="status status-error inline-block"></span>{" "}
              Password must be 8+ characters
            </span>
          </div>{" "}
          <div className="flex flex-col gap-1">
            <label className="input input-border flex max-w-none items-center gap-2  no focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                  clipRule="evenodd"
                ></path>
              </svg>{" "}
              <input
                type="password"
                className="grow"
                placeholder="Re-enter password"
                name="re-password"
                required
              />
            </label>{" "}
          </div>{" "}
          <div className="card-actions items-center gap-6">
            <button type="submit" className="btn btn-primary">
              Register
            </button>{" "}
            <button className="link" onClick={handleScreenChange}>
              Or login
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
