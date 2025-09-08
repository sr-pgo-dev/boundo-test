import type { UserAstrology } from "@shared/schema";

// Astrology sign type
export type AstrologySign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' |
  'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

// Astrology sign date ranges (month-day format)
const SIGN_DATES: Array<{ sign: AstrologySign; start: string; end: string }> = [
  { sign: 'capricorn', start: '12-22', end: '01-19' },
  { sign: 'aquarius', start: '01-20', end: '02-18' },
  { sign: 'pisces', start: '02-19', end: '03-20' },
  { sign: 'aries', start: '03-21', end: '04-19' },
  { sign: 'taurus', start: '04-20', end: '05-20' },
  { sign: 'gemini', start: '05-21', end: '06-20' },
  { sign: 'cancer', start: '06-21', end: '07-22' },
  { sign: 'leo', start: '07-23', end: '08-22' },
  { sign: 'virgo', start: '08-23', end: '09-22' },
  { sign: 'libra', start: '09-23', end: '10-22' },
  { sign: 'scorpio', start: '10-23', end: '11-21' },
  { sign: 'sagittarius', start: '11-22', end: '12-21' },
];

// Astrology compatibility matrix - scoring from 0-20
const COMPATIBILITY_MATRIX: Record<AstrologySign, Record<AstrologySign, number>> = {
  aries: {
    aries: 18, taurus: 10, gemini: 15, cancer: 8, leo: 20, virgo: 12,
    libra: 15, scorpio: 12, sagittarius: 20, capricorn: 10, aquarius: 18, pisces: 12
  },
  taurus: {
    aries: 10, taurus: 18, gemini: 8, cancer: 15, leo: 12, virgo: 20,
    libra: 12, scorpio: 15, sagittarius: 8, capricorn: 20, aquarius: 10, pisces: 18
  },
  gemini: {
    aries: 15, taurus: 8, gemini: 18, cancer: 10, leo: 15, virgo: 12,
    libra: 20, scorpio: 8, sagittarius: 15, capricorn: 12, aquarius: 20, pisces: 10
  },
  cancer: {
    aries: 8, taurus: 15, gemini: 10, cancer: 18, leo: 12, virgo: 15,
    libra: 10, scorpio: 20, sagittarius: 8, capricorn: 15, aquarius: 12, pisces: 20
  },
  leo: {
    aries: 20, taurus: 12, gemini: 15, cancer: 12, leo: 18, virgo: 10,
    libra: 15, scorpio: 8, sagittarius: 20, capricorn: 8, aquarius: 15, pisces: 12
  },
  virgo: {
    aries: 12, taurus: 20, gemini: 12, cancer: 15, leo: 10, virgo: 18,
    libra: 8, scorpio: 15, sagittarius: 10, capricorn: 20, aquarius: 8, pisces: 15
  },
  libra: {
    aries: 15, taurus: 12, gemini: 20, cancer: 10, leo: 15, virgo: 8,
    libra: 18, scorpio: 12, sagittarius: 15, capricorn: 8, aquarius: 20, pisces: 10
  },
  scorpio: {
    aries: 12, taurus: 15, gemini: 8, cancer: 20, leo: 8, virgo: 15,
    libra: 12, scorpio: 18, sagittarius: 10, capricorn: 15, aquarius: 10, pisces: 20
  },
  sagittarius: {
    aries: 20, taurus: 8, gemini: 15, cancer: 8, leo: 20, virgo: 10,
    libra: 15, scorpio: 10, sagittarius: 18, capricorn: 12, aquarius: 15, pisces: 8
  },
  capricorn: {
    aries: 10, taurus: 20, gemini: 12, cancer: 15, leo: 8, virgo: 20,
    libra: 8, scorpio: 15, sagittarius: 12, capricorn: 18, aquarius: 10, pisces: 15
  },
  aquarius: {
    aries: 18, taurus: 10, gemini: 20, cancer: 12, leo: 15, virgo: 8,
    libra: 20, scorpio: 10, sagittarius: 15, capricorn: 10, aquarius: 18, pisces: 12
  },
  pisces: {
    aries: 12, taurus: 18, gemini: 10, cancer: 20, leo: 12, virgo: 15,
    libra: 10, scorpio: 20, sagittarius: 8, capricorn: 15, aquarius: 12, pisces: 18
  }
};

/**
 * Calculate astrology sign from birthdate
 * Handles edge cases around sign boundary dates
 */
export function calculateAstrologySign(birthdate: string): AstrologySign {
  const date = new Date(birthdate);
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  const monthDay = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  // Special handling for Capricorn (spans year boundary)
  if (monthDay >= '12-22' || monthDay <= '01-19') {
    return 'capricorn';
  }

  // Find the sign for the given date
  for (const { sign, start, end } of SIGN_DATES) {
    if (sign === 'capricorn') continue; // Already handled above
    
    if (monthDay >= start && monthDay <= end) {
      return sign;
    }
  }

  // Fallback (should never reach here with valid dates)
  return 'aries';
}

/**
 * Get astrology compatibility score between two signs
 */
export function getAstrologyCompatibility(sign1: AstrologySign, sign2: AstrologySign): number {
  return COMPATIBILITY_MATRIX[sign1][sign2];
}

/**
 * Get compatibility category description
 */
export function getCompatibilityCategory(score: number): string {
  if (score >= 18) return 'Excellent';
  if (score >= 15) return 'Good';
  if (score >= 12) return 'Moderate';
  if (score >= 8) return 'Challenging';
  return 'Difficult';
}

/**
 * Get sign display name
 */
export function getSignDisplayName(sign: AstrologySign): string {
  const names: Record<AstrologySign, string> = {
    aries: 'Aries',
    taurus: 'Taurus',
    gemini: 'Gemini',
    cancer: 'Cancer',
    leo: 'Leo',
    virgo: 'Virgo',
    libra: 'Libra',
    scorpio: 'Scorpio',
    sagittarius: 'Sagittarius',
    capricorn: 'Capricorn',
    aquarius: 'Aquarius',
    pisces: 'Pisces'
  };
  return names[sign];
}

/**
 * Get sign symbol
 */
export function getSignSymbol(sign: AstrologySign): string {
  const symbols: Record<AstrologySign, string> = {
    aries: '♈',
    taurus: '♉',
    gemini: '♊',
    cancer: '♋',
    leo: '♌',
    virgo: '♍',
    libra: '♎',
    scorpio: '♏',
    sagittarius: '♐',
    capricorn: '♑',
    aquarius: '♒',
    pisces: '♓'
  };
  return symbols[sign];
}

/**
 * Get sign date range description
 */
export function getSignDateRange(sign: AstrologySign): string {
  const ranges: Record<AstrologySign, string> = {
    aries: 'Mar 21 - Apr 19',
    taurus: 'Apr 20 - May 20',
    gemini: 'May 21 - Jun 20',
    cancer: 'Jun 21 - Jul 22',
    leo: 'Jul 23 - Aug 22',
    virgo: 'Aug 23 - Sep 22',
    libra: 'Sep 23 - Oct 22',
    scorpio: 'Oct 23 - Nov 21',
    sagittarius: 'Nov 22 - Dec 21',
    capricorn: 'Dec 22 - Jan 19',
    aquarius: 'Jan 20 - Feb 18',
    pisces: 'Feb 19 - Mar 20'
  };
  return ranges[sign];
}