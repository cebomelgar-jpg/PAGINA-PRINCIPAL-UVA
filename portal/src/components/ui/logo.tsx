import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  imageClassName,
  priority = false,
}: {
  href?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl focus-visible:outline-offset-4",
        className,
      )}
      aria-label="Un Viaje Astral · Inicio"
    >
      <Image
        src="/brand/logo-header.webp"
        width={207}
        height={100}
        alt="Un Viaje Astral"
        priority={priority}
        className={cn("h-10 w-auto object-contain", imageClassName)}
      />
    </Link>
  );
}
