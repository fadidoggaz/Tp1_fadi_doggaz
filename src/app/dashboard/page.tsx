import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/actions/auth";
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <main><h1>Bonjour {user.name}</h1><p>{user.email}</p><p>Zone privée</p>
    <form action={logout}><button>Déconnexion</button></form></main>;
}
