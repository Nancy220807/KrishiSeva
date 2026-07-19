import type { PartnerInfo } from "../lib/types";

// Stylized SVG logos for each hackathon partner.
// Each logo is a self-contained SVG component that renders the partner's brand mark.

interface LogoProps {
  size?: number;
  className?: string;
}

export function GnaniLogo({ size = 40, className = "" }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#2563eb" />
      <path d="M24 10C16 10 10 16 10 24C10 28 12 31 15 33" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="18" cy="20" r="2.5" fill="white" />
      <circle cx="30" cy="20" r="2.5" fill="white" />
      <path d="M18 30C20 32 28 32 30 30" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M34 14C36 16 37 19 37 22" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M38 10C41 13 42 17 42 21" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Mem0Logo({ size = 40, className = "" }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#059669" />
      <circle cx="24" cy="24" r="14" stroke="white" strokeWidth="2.5" fill="none" opacity="0.4" />
      <circle cx="24" cy="24" r="9" stroke="white" strokeWidth="2.5" fill="none" opacity="0.6" />
      <circle cx="24" cy="24" r="4" fill="white" />
      <path d="M24 10V16M24 32V38M10 24H16M32 24H38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function KeployLogo({ size = 40, className = "" }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#d97706" />
      <path d="M16 14L10 24L16 34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M32 14L38 24L32 34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M27 12L21 36" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function OutlierLogo({ size = 40, className = "" }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#dc2626" />
      <circle cx="14" cy="34" r="3" fill="white" opacity="0.5" />
      <circle cx="22" cy="30" r="3" fill="white" opacity="0.5" />
      <circle cx="30" cy="32" r="3" fill="white" opacity="0.5" />
      <circle cx="18" cy="22" r="3" fill="white" opacity="0.5" />
      <circle cx="26" cy="24" r="3" fill="white" opacity="0.5" />
      <circle cx="36" cy="16" r="5" fill="white" />
      <path d="M36 10L36 8M36 22L36 24M30 16L28 16M42 16L44 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function AlchemystLogo({ size = 40, className = "" }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#7c3aed" />
      <path d="M24 8L12 28H20L18 40L36 18H28L30 8H24Z" fill="white" />
    </svg>
  );
}

export function StartupNewsLogo({ size = 40, className = "" }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#0891b2" />
      <rect x="10" y="12" width="28" height="24" rx="2" stroke="white" strokeWidth="2.5" fill="none" />
      <path d="M14 18H34M14 23H30M14 28H26M14 33H22" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="38" cy="12" r="4" fill="#fbbf24" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

export const PARTNER_LOGOS: Record<string, (props: LogoProps) => JSX.Element> = {
  "Gnani.ai": GnaniLogo,
  "Mem0": Mem0Logo,
  "Keploy": KeployLogo,
  "Outlier": OutlierLogo,
  "Alchemyst AI": AlchemystLogo,
  "StartupNews.fyi": StartupNewsLogo,
};

export function PartnerLogo({ name, size = 40, className = "" }: { name: string; size?: number; className?: string }) {
  const Logo = PARTNER_LOGOS[name];
  return Logo ? <Logo size={size} className={className} /> : null;
}

export function AllPartnerLogos({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <GnaniLogo size={size} />
      <Mem0Logo size={size} />
      <KeployLogo size={size} />
      <OutlierLogo size={size} />
      <AlchemystLogo size={size} />
      <StartupNewsLogo size={size} />
    </div>
  );
}

export { PARTNERS } from "../lib/types";
export type { PartnerInfo };
