/**
 * Generates a consistent color based on a username string
 * Uses a simple hash function to ensure the same username always produces the same color
 */
export const generateUserColor = (username: string): string => {
  if (!username) return '#808080'; // Default gray for empty/null usernames

  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to positive number
  hash = Math.abs(hash);

  // Generate HSL color with good saturation and lightness for readability
  const hue = hash % 360;
  const saturation = 65 + (hash % 20); // 65-85% saturation
  const lightness = 45 + (hash % 15); // 45-60% lightness

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Generates a consistent hex color based on a username string
 * Alternative implementation that returns hex colors
 */
export const generateUserColorHex = (username: string): string => {
  if (!username) return '#808080';

  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  hash = Math.abs(hash);

  // Generate RGB values
  const r = (hash & 0xFF0000) >> 16;
  const g = (hash & 0x00FF00) >> 8;
  const b = hash & 0x0000FF;

  // Ensure minimum brightness and avoid too dark colors
  const adjustedR = Math.max(r, 100);
  const adjustedG = Math.max(g, 100);
  const adjustedB = Math.max(b, 100);

  return `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;
}; 