/**
 * Cryptographic utilities using Web Crypto API
 * Provides SHA-256 hashing for tamper-evident event tracking
 */

/**
 * Calculate SHA-256 hash of a string
 * @param message - The string to hash
 * @returns Hex-encoded SHA-256 hash
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Calculate SHA-256 hash of an event object
 * @param event - Event object to hash
 * @returns Hex-encoded SHA-256 hash
 */
export async function hashEvent(event: any): Promise<string> {
  const eventString = JSON.stringify(event, null, 0);
  return sha256(eventString);
}

/**
 * Calculate combined SHA-256 hash of multiple events
 * Useful for creating tamper-evident story digests
 * @param events - Array of events to hash
 * @returns Hex-encoded SHA-256 hash of concatenated event hashes
 */
export async function hashEventArray(events: any[]): Promise<string> {
  const hashes = await Promise.all(events.map(e => hashEvent(e)));
  const combined = hashes.join('');
  return sha256(combined);
}
