/**
 * Returns a short base36 id matching previous Math.random().toString(36).substr(2, 9) shape.
 */
export function randomAlphaId(): string {
  return Math.random().toString(36).slice(2, 11);
}
