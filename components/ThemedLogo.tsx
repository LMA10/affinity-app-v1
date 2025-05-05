import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export function ThemedLogo(props: Omit<React.ComponentProps<typeof Image>, "src" | "alt">) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const logoSrc = theme === "dark" ? "/dark-theme-icon.svg" : "/light-theme-icon.svg";
  return (
    <Image
      src={logoSrc}
      alt="Logo"
      width={180}
      height={60}
      priority
      {...props}
    />
  );
} 