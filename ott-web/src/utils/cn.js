import { clsx } from 'clsx'

/**
 * Utility function to combine class names with clsx
 * @param {...any} inputs - Class names to combine
 * @returns {string} Combined class names
 */
export function cn(...inputs) {
  return clsx(inputs)
}

export default cn
