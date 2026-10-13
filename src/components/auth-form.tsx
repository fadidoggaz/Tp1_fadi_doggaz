"use client";
import Link from "next/link";
import { useActionState } from "react";
import { login, register } from "@/actions/auth";

export default function AuthForm({ mode }: { mode: "register" | "login" }) {
  const isRegister = mode === "register";
  const [state, action, pending] = useActionState(isRegister ? register : login, { error: "" });
  return (
    <main>
      <h1>{isRegister ? "Créer un compte" : "Connexion"}</h1>
      <form action={action}>
        {isRegister && <label>Nom<input name="name" autoComplete="name" minLength={2} maxLength={80} required /></label>}
        <label>Email<input name="email" type="email" autoComplete="email" required /></label>
        <label>Mot de passe<input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : 1} required /></label>
        {state.error && <p role="alert">{state.error}</p>}
        <button disabled={pending}>{pending ? "Veuillez patienter…" : isRegister ? "Créer le compte" : "Se connecter"}</button>
      </form>
      <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Déjà inscrit ? Se connecter" : "Créer un compte"}</Link>
    </main>
  );
}
