import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const pad = (n: number | string) => String(n).padStart(2, '0');

export const hmToMinutes = (hm: string | undefined | null) => {
  if (!hm || !hm.includes(':')) return null;
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
};

export const minutesToHM = (m: number | null) => {
  if (m === null || isNaN(m)) return null;
  return `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
};

export const format12NoSuffix = (hm: string | undefined | null) => {
  if (!hm || !hm.includes(':')) return '--:--';
  const [h, m] = hm.split(':');
  let hh = parseInt(h, 10);
  hh = hh % 12 || 12;
  return `${hh}:${pad(Number(m))}`;
};
