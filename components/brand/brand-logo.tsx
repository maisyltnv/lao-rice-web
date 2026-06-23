import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

/** Shared rice shop logo — `/public/logo.png` */
export function BrandLogo({ size = 40, className, priority }: BrandLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="ເຂົ້າສານ"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full object-cover", className)}
      priority={priority}
    />
  );
}
