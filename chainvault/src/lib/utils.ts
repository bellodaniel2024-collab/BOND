/**
 * BOND — Shared Utility Functions
 */
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Format a full wallet address to a shortened display version.
 * e.g. "0x1234...5678"
 */
export function formatAddress(
  address: string,
  prefixChars = 6,
  suffixChars = 4,
): string {
  if (!address || address.length < prefixChars + suffixChars) return address
  return `${address.slice(0, prefixChars)}...${address.slice(-suffixChars)}`
}

/**
 * Format a number to a fixed decimal places, trimming trailing zeros.
 */
export function formatAmount(
  amount: string | number,
  maxDecimals = 8,
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0'

  // Show fewer decimals for large amounts
  const decimals =
    num >= 1000 ? 2 : num >= 1 ? 4 : num >= 0.001 ? 6 : maxDecimals

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format a Unix timestamp or Date to a readable string.
 */
export function formatDate(
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  })
}

/**
 * Format a relative time (e.g., "2 minutes ago").
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const seconds = Math.floor(diff / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return formatDate(d)
}

/**
 * Truncate a transaction hash for display.
 */
export function formatTxHash(hash: string, chars = 8): string {
  if (!hash) return '—'
  return `${hash.slice(0, chars + 2)}...${hash.slice(-(chars / 2))}`
}

/**
 * Get the block explorer transaction URL.
 */
export function getExplorerTxUrl(explorerUrl: string, txHash: string): string {
  return `${explorerUrl}/tx/${txHash}`
}

/**
 * Safely parse a numeric string.
 */
export function safeParseFloat(value: string): number | null {
  const n = parseFloat(value)
  return isNaN(n) ? null : n
}

/**
 * Debounce a function.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

/**
 * Map transaction status to display properties.
 */
export function getTransactionStatusConfig(status: string): {
  label: string
  badgeClass: string
  description: string
} {
  const map: Record<string, { label: string; badgeClass: string; description: string }> = {
    PREPARING: {
      label: 'Preparing',
      badgeClass: 'badge-neutral',
      description: 'Transaction is being prepared.',
    },
    AWAITING_AUTHORIZATION: {
      label: 'Awaiting Authorization',
      badgeClass: 'badge-warning',
      description: 'Waiting for wallet authorization.',
    },
    PENDING: {
      label: 'Pending',
      badgeClass: 'badge-info',
      description: 'Broadcast to the network. Awaiting mining.',
    },
    CONFIRMING: {
      label: 'Confirming',
      badgeClass: 'badge-info',
      description: 'Mined. Waiting for more confirmations.',
    },
    CONFIRMED: {
      label: 'Confirmed',
      badgeClass: 'badge-success',
      description: 'Transaction confirmed on the blockchain.',
    },
    FAILED: {
      label: 'Failed',
      badgeClass: 'badge-danger',
      description: 'Transaction failed or was reverted.',
    },
    CANCELLED: {
      label: 'Cancelled',
      badgeClass: 'badge-neutral',
      description: 'Transaction was cancelled.',
    },
  }
  return map[status] ?? { label: status, badgeClass: 'badge-neutral', description: '' }
}
