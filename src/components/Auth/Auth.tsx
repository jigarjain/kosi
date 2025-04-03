import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LocalAuth } from "@/types/Auth";
import { LocalUser } from "@/types/User";
import { useAppState } from "@/context/AppState";
import Store from "@/store";
import Login from "./Login";
import RecoveryPhrase from "./RecoveryPhrase";
import Signup from "./Signup";

type AuthScreen = "register" | "login" | "recoveryPhrase";

export const Auth = ({ onAuthComplete }: { onAuthComplete: () => void }) => {
  const { setLocalAuth, setCurrentUser } = useAppState();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("register");
  const [recoveryPhrase, setRecoveryPhrase] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const loginMutation = useMutation<
    { localAuth: LocalAuth; localUser: LocalUser },
    Error,
    { username: string; password: string }
  >({
    mutationFn: async ({
      username,
      password
    }: {
      username: string;
      password: string;
    }) => {
      const result = await Store.getAuth(username, password);
      if (!result.localAuth || !result.localUser) {
        throw new Error("Authentication failed");
      }
      return result as { localAuth: LocalAuth; localUser: LocalUser };
    },
    onSuccess: ({ localAuth, localUser }) => {
      setErrorMessage("");
      setLocalAuth(localAuth);
      setCurrentUser(localUser);
      onAuthComplete();
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  });

  const signupMutation = useMutation<
    { recoveryPhrase: string },
    Error,
    { username: string; password: string; name: string }
  >({
    mutationFn: async ({
      username,
      password,
      name
    }: {
      username: string;
      password: string;
      name: string;
    }) => {
      return Store.registerUser(name, username, password);
    },
    onSuccess: ({ recoveryPhrase }) => {
      setRecoveryPhrase(recoveryPhrase);
      setAuthScreen("recoveryPhrase");
      setErrorMessage("");
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  });

  const handleScreenChange = () => {
    setErrorMessage("");
    setAuthScreen(authScreen === "login" ? "register" : "login");
  };

  const handleRecoveryClose = () => {
    setErrorMessage("");
    setAuthScreen("login");
    setRecoveryPhrase(null);
  };

  const handleLogin = async (formData: FormData) => {
    setErrorMessage("");
    const formEntries = Object.fromEntries(formData);
    const { username, password } = formEntries as Record<string, string>;
    loginMutation.mutate({ username, password });
  };

  const handleSignup = async (formData: FormData) => {
    setErrorMessage("");
    const formEntries = Object.fromEntries(formData);
    const { username, password, name } = formEntries as Record<string, string>;
    signupMutation.mutate({ username, password, name });
  };

  return (
    <>
      {errorMessage && (
        <div role="alert" className="alert alert-error alert-soft">
          <span>{errorMessage}</span>
        </div>
      )}
      {authScreen === "login" && (
        <Login
          handleScreenChange={handleScreenChange}
          handleSubmit={handleLogin}
        />
      )}
      {authScreen === "register" && (
        <Signup
          handleScreenChange={handleScreenChange}
          handleSubmit={handleSignup}
        />
      )}
      {authScreen === "recoveryPhrase" && (
        <RecoveryPhrase
          phrase={recoveryPhrase!}
          onClose={handleRecoveryClose}
        />
      )}
    </>
  );
};
