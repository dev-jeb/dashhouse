/**
 * Shared region display names for Census Bureau region codes.
 * The Census API uses inconsistent codes across endpoints —
 * e.g. "NE" for Northeast in housing vacancy, "NO" in residential sales.
 * This map handles both.
 */
export const REGION_DISPLAY_NAMES: Record<string, string> = {
  US: 'United States',
  MW: 'Midwest',
  NE: 'Northeast',
  NO: 'Northeast',
  SO: 'South',
  WE: 'West',
};

export const REGION_COLORS: Record<string, string> = {
  'United States': '#10b981', // emerald-500
  'Midwest': '#f59e0b',       // amber-500
  'Northeast': '#3b82f6',     // blue-500
  'South': '#ef4444',         // red-500
  'West': '#8b5cf6',          // violet-500
};
