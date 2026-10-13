import AuthForm from "@/components/auth-form";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  const { registered } = await searchParams;
  return <>{registered === "1" && <p role="status">Compte créé. Vous pouvez vous connecter.</p>}<AuthForm mode="login" /></>;
}
