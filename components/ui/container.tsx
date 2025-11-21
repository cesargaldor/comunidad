import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(className, "max-w-[90%] 2xl:max-w-[60%] mx-auto")}>
      {children}
    </div>
  );
}
