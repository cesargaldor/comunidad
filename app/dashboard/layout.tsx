import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SessionProvider } from "@/components/session-provider";
import Navbar from "@/components/navbar";
import Container from "@/components/ui/container";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("session", session);

  return (
    <SessionProvider session={session}>
      <div className="bg-neutral-50">
        <Navbar />
        <Container className="py-10 min-h-[calc(100vh-144px)]">
          {children}
        </Container>
      </div>
    </SessionProvider>
  );
}
