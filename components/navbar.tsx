"use client";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import Container from "./ui/container";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSessionContext } from "@/components/session-provider";

export default function Navbar() {
  const pathname = usePathname();
  const session = useSessionContext();

  return (
    <nav className="bg-white py-6">
      <Container>
        <div className="flex items-center justify-between">
          <div>
            <Image
              src="/assets/images/va.webp"
              width={40}
              height={40}
              alt="logo"
            />
          </div>
          {session?.user && (
            <div>
              <Avatar>
                <AvatarImage src={session?.user?.image!} alt="user-logo" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        <div className="flex items-center flex-nowrap gap-4 overflow-x-auto mt-6">
          {ROUTES.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={`w-fit px-2 py-1 rounded ${
                pathname === route.path && "bg-neutral-100 font-medium"
              }`}
            >
              {route.name}
            </Link>
          ))}
        </div>
      </Container>
    </nav>
  );
}
