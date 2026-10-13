import Link from "next/link";
export default function Home() {
  return <main><h1>TP — Authentification</h1><p>Next.js, TypeScript, Prisma et SQLite</p>
    <nav><Link href="/register">Créer un compte</Link> · <Link href="/login">Se connecter</Link> · <Link href="/dashboard">Dashboard</Link></nav></main>;
}
