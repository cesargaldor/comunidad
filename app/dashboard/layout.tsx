import Navbar from "@/components/navbar";
import Container from "@/components/ui/container";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-neutral-50">
      <Navbar />
      <Container className="py-10 min-h-[calc(100vh-144px)]">
        {children}
      </Container>
    </div>
  );
}
