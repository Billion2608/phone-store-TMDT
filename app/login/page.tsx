import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const requested = (await searchParams).next;
  const nextPath =
    requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/admin";

  return (
    <div className="flex flex-1 items-center justify-center bg-[linear-gradient(135deg,#fdfbf7,#f5f2eb)] px-4 py-8">
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
