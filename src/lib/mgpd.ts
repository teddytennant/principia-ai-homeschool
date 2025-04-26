export const MGPD_THRESHOLDS = {
  HINTS: 0.3,
  EXAMPLES: 0.6,
  SOLUTIONS: 0.9,
};

export function getTier(score: number): number {
  if (score < MGPD_THRESHOLDS.HINTS) return 0;
  if (score < MGPD_THRESHOLDS.EXAMPLES) return 1;
  if (score < MGPD_THRESHOLDS.SOLUTIONS) return 2;
  return 3;
}

export function nextThreshold(tier: number): number | null {
  switch (tier) {
    case 0: return MGPD_THRESHOLDS.HINTS;
    case 1: return MGPD_THRESHOLDS.EXAMPLES;
    case 2: return MGPD_THRESHOLDS.SOLUTIONS;
    default: return null;
  }
}
