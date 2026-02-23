import { Stethoscope } from "lucide-react";

interface NeoCareLogoProps {
  size?: number;
  className?: string;
}

export default function NeoCareLogo({ size = 64, className = "" }: NeoCareLogoProps) {
  const iconSize = size * 0.6;
  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-3 ${className}`}
      style={{ width: size, height: size }}
    >
      <Stethoscope className="text-white" style={{ width: iconSize, height: iconSize }} />
    </div>
  );
}

