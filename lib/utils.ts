import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date)
}

export function generateTicketNumber(): string {
  // Generate a ticket in the format: 15G 12902 (Two digits, one alphabet letter, space, five digits)
  const firstTwoDigits = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0")
  const alphabetLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const fiveDigits = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0")

  return `${firstTwoDigits}${alphabetLetter} ${fiveDigits}`
}

export function shortenAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Formats a wallet address for display by truncating the middle section
 * @param address Full wallet address
 * @returns Shortened address in format 0x1234...5678
 */
export function formatWalletAddress(address: string): string {
  if (!address) return '';
  
  // Remove any dev mode text
  const cleanAddress = address.replace(/\s*\(dev\s*mode\)\s*/i, '').trim();
  
  // If it already contains ... just return it
  if (cleanAddress.includes('...')) return cleanAddress;
  
  // Otherwise format it nicely
  if (cleanAddress.length > 12) {
    return `${cleanAddress.substring(0, 6)}...${cleanAddress.substring(cleanAddress.length - 4)}`;
  }
  
  return cleanAddress;
}
