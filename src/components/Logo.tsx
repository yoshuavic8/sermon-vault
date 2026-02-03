import Image from "next/image";

interface LogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Logo({
  variant = "full",
  size = "md",
  className = "",
}: LogoProps) {
  const sizeMap = {
    sm: { width: 120, height: 40 },
    md: { width: 180, height: 60 },
    lg: { width: 240, height: 80 },
    xl: { width: 300, height: 100 },
  };

  const iconSizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
  };

  if (variant === "icon") {
    return (
      <Image
        src="/icon.png"
        alt="Sermon Vault Icon"
        width={iconSizeMap[size]}
        height={iconSizeMap[size]}
        className={className}
        priority
      />
    );
  }

  return (
    <Image
      src="/logo.png"
      alt="Sermon Vault"
      width={sizeMap[size].width}
      height={sizeMap[size].height}
      className={className}
      priority
    />
  );
}
