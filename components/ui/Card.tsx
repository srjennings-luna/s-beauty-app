import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  hover = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={`card ${hover ? "card-hover cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardImage({
  src,
  alt,
  aspectRatio = "video",
}: {
  src: string;
  alt: string;
  aspectRatio?: "video" | "square" | "portrait";
}) {
  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
  };

  return (
    <div className={`relative ${aspectClasses[aspectRatio]} overflow-hidden`}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
