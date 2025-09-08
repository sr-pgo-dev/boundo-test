import { db } from "./db";
import { 
  users, 
  userProfiles, 
  interests, 
  lifestylePreferences, 
  valuesAndBeliefs,
  dealbreakers,
  partnerPreferences,
  userAstrology,
  matches,
  compatibilityDetails,
  type UserProfile,
  type Interest,
  type LifestylePreferences,
  type ValuesAndBeliefs,
  type Dealbreakers,
  type PartnerPreferences,
  type UserAstrology as UserAstrologyType,
  type InsertMatch,
  type InsertCompatibilityDetails
} from "@shared/schema";
import { calculateAstrologySign, getAstrologyCompatibility, type AstrologySign } from "./astrology";
import { eq, and, not, exists, inArray } from "drizzle-orm";

export interface CompatibilityScore {
  totalScore: number;
  sharedInterestsScore: number;
  ageCompatibilityScore: number;
  locationProximityScore: number;
  genderOrientationScore: number;
  astrologyCompatibilityScore: number | null;
  sharedInterests: string[];
  breakdown: {
    interests: { weight: number; score: number; weighted: number };
    age: { weight: number; score: number; weighted: number };
    location: { weight: number; score: number; weighted: number };
    genderOrientation: { weight: number; score: number; weighted: number };
    astrology?: { weight: number; score: number; weighted: number };
  };
}

export interface UserMatchProfile {
  user: {
    id: string;
    username: string;
  };
  profile: UserProfile;
  interests: Interest[];
  lifestyle: LifestylePreferences | null;
  values: ValuesAndBeliefs | null;
  dealbreakers: Dealbreakers | null;
  partnerPrefs: PartnerPreferences | null;
  astrology: UserAstrologyType | null;
}

/**
 * Calculate distance between two coordinates (simplified)
 * In production, you'd use actual geocoding and distance calculation
 */
function calculateDistance(loc1: string, loc2: string): number {
  // Mock distance calculation - in production, use actual coordinates
  if (loc1 === loc2) return 0;
  // Return random distance between 5-50 miles for demo
  return Math.floor(Math.random() * 45) + 5;
}

/**
 * Check if user passes dealbreaker filters
 */
function passesDealbreakerFilters(
  user1: UserMatchProfile,
  user2: UserMatchProfile
): boolean {
  const user1Dealbreakers = Array.isArray(user1.dealbreakers?.dealbreakers) 
    ? user1.dealbreakers.dealbreakers as string[]
    : [];
  const user2Dealbreakers = Array.isArray(user2.dealbreakers?.dealbreakers)
    ? user2.dealbreakers.dealbreakers as string[]
    : [];

  // Check if user2 triggers any of user1's dealbreakers
  for (const dealbreaker of user1Dealbreakers) {
    if (checkDealbreaker(dealbreaker, user2)) {
      return false;
    }
  }

  // Check if user1 triggers any of user2's dealbreakers
  for (const dealbreaker of user2Dealbreakers) {
    if (checkDealbreaker(dealbreaker, user1)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a user triggers a specific dealbreaker
 */
function checkDealbreaker(dealbreaker: string, user: UserMatchProfile): boolean {
  const socialHabits = user.lifestyle?.socialHabits as Record<string, string> | null;
  
  switch (dealbreaker) {
    case 'smoking':
      return socialHabits?.smoking === 'frequently';
    case 'heavy-drinking':
      return socialHabits?.drinking === 'frequently';
    case 'wants-kids-soon':
      return user.values?.kids === 'want-soon';
    case 'doesnt-want-kids':
      return user.values?.kids === 'dont-want';
    case 'long-distance':
      return Boolean(user.partnerPrefs?.longDistance) === false;
    // Add more dealbreaker checks as needed
    default:
      return false;
  }
}

/**
 * Calculate compatibility score between two users
 */
export function calculateCompatibilityScore(
  user1: UserMatchProfile, 
  user2: UserMatchProfile
): CompatibilityScore {
  const hasAstrology = user1.astrology?.enableAstrologyMatching && 
                      user2.astrology?.enableAstrologyMatching;

  // Weights based on whether astrology is enabled
  const weights = hasAstrology 
    ? { interests: 0.25, age: 0.15, location: 0.15, genderOrientation: 0.25, astrology: 0.20 }
    : { interests: 0.30, age: 0.20, location: 0.20, genderOrientation: 0.30 };

  // 1. Shared Interests Score (0-100)
  const user1Interests = user1.interests.map(i => i.interest);
  const user2Interests = user2.interests.map(i => i.interest);
  const sharedInterests = user1Interests.filter(interest => 
    user2Interests.includes(interest)
  );
  const totalInterests = Math.max(user1Interests.length, user2Interests.length);
  const interestsScore = totalInterests > 0 
    ? Math.round((sharedInterests.length / totalInterests) * 100)
    : 0;

  // 2. Age Compatibility Score (0-100)
  const ageDiff = Math.abs(user1.profile.age - user2.profile.age);
  const ageScore = Math.max(0, 100 - (ageDiff * 5)); // Penalize 5 points per year difference

  // 3. Location Proximity Score (0-100)
  const distance = calculateDistance(
    `${user1.profile.city}, ${user1.profile.state}`,
    `${user2.profile.city}, ${user2.profile.state}`
  );
  const locationScore = Math.max(0, 100 - (distance * 2)); // Penalize 2 points per mile

  // 4. Gender/Orientation Compatibility (0-100)
  const genderOrientationScore = checkGenderOrientationCompatibility(user1, user2);

  // 5. Astrology Compatibility (0-100, if enabled)
  let astrologyScore: number | null = null;
  if (hasAstrology && user1.astrology && user2.astrology) {
    const compatibilityPoints = getAstrologyCompatibility(
      user1.astrology.sunSign as AstrologySign,
      user2.astrology.sunSign as AstrologySign
    );
    astrologyScore = Math.round((compatibilityPoints / 20) * 100); // Convert 0-20 to 0-100
  }

  // Calculate weighted scores
  const breakdown = {
    interests: {
      weight: weights.interests,
      score: interestsScore,
      weighted: interestsScore * weights.interests
    },
    age: {
      weight: weights.age,
      score: ageScore,
      weighted: ageScore * weights.age
    },
    location: {
      weight: weights.location,
      score: locationScore,
      weighted: locationScore * weights.location
    },
    genderOrientation: {
      weight: weights.genderOrientation,
      score: genderOrientationScore,
      weighted: genderOrientationScore * weights.genderOrientation
    },
    ...(hasAstrology && astrologyScore !== null && {
      astrology: {
        weight: weights.astrology!,
        score: astrologyScore,
        weighted: astrologyScore * weights.astrology!
      }
    })
  };

  const totalScore = Math.round(
    breakdown.interests.weighted +
    breakdown.age.weighted +
    breakdown.location.weighted +
    breakdown.genderOrientation.weighted +
    (breakdown.astrology?.weighted || 0)
  );

  return {
    totalScore,
    sharedInterestsScore: interestsScore,
    ageCompatibilityScore: ageScore,
    locationProximityScore: locationScore,
    genderOrientationScore: genderOrientationScore,
    astrologyCompatibilityScore: astrologyScore,
    sharedInterests,
    breakdown
  };
}

/**
 * Check gender and orientation compatibility
 */
function checkGenderOrientationCompatibility(
  user1: UserMatchProfile,
  user2: UserMatchProfile
): number {
  const u1Gender = user1.profile.gender;
  const u1Orientation = user1.profile.orientation;
  const u2Gender = user2.profile.gender;
  const u2Orientation = user2.profile.orientation;

  // Perfect matches
  if ((u1Gender === 'male' && u1Orientation === 'straight' && u2Gender === 'female' && u2Orientation === 'straight') ||
      (u1Gender === 'female' && u1Orientation === 'straight' && u2Gender === 'male' && u2Orientation === 'straight') ||
      (u1Gender === 'male' && u1Orientation === 'gay' && u2Gender === 'male' && u2Orientation === 'gay') ||
      (u1Gender === 'female' && u1Orientation === 'lesbian' && u2Gender === 'female' && u2Orientation === 'lesbian')) {
    return 100;
  }

  // Bisexual/pansexual compatibility
  if (u1Orientation === 'bisexual' || u1Orientation === 'pansexual' || 
      u2Orientation === 'bisexual' || u2Orientation === 'pansexual') {
    return 80;
  }

  // No compatibility
  return 0;
}

/**
 * Get user match profile with all related data
 */
export async function getUserMatchProfile(userId: string): Promise<UserMatchProfile | null> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user[0]) return null;

  const [profile, userInterests, lifestyle, values, userDealbreakers, partnerPrefs, astrology] = await Promise.all([
    db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1),
    db.select().from(interests).where(eq(interests.userId, userId)),
    db.select().from(lifestylePreferences).where(eq(lifestylePreferences.userId, userId)).limit(1),
    db.select().from(valuesAndBeliefs).where(eq(valuesAndBeliefs.userId, userId)).limit(1),
    db.select().from(dealbreakers).where(eq(dealbreakers.userId, userId)).limit(1),
    db.select().from(partnerPreferences).where(eq(partnerPreferences.userId, userId)).limit(1),
    db.select().from(userAstrology).where(eq(userAstrology.userId, userId)).limit(1)
  ]);

  if (!profile[0]) return null;

  return {
    user: {
      id: user[0].id,
      username: user[0].username
    },
    profile: profile[0],
    interests: userInterests,
    lifestyle: lifestyle[0] || null,
    values: values[0] || null,
    dealbreakers: userDealbreakers[0] || null,
    partnerPrefs: partnerPrefs[0] || null,
    astrology: astrology[0] || null
  };
}

/**
 * Find potential matches for a user
 */
export async function findPotentialMatches(userId: string, limit = 10): Promise<UserMatchProfile[]> {
  const currentUser = await getUserMatchProfile(userId);
  if (!currentUser || !currentUser.partnerPrefs) {
    return [];
  }

  const partnerPrefs = currentUser.partnerPrefs;

  // Get users that haven't been matched/passed already
  const existingMatchedUserIds = await db
    .select({ matchedUserId: matches.matchedUserId })
    .from(matches)
    .where(eq(matches.userId, userId));

  const excludedUserIds = [userId, ...existingMatchedUserIds.map(m => m.matchedUserId)];

  // Find potential matches based on partner preferences
  const potentialUsers = await db
    .select()
    .from(users)
    .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(
      and(
        not(inArray(users.id, excludedUserIds)),
        eq(users.onboardingCompleted, true)
      )
    )
    .limit(limit * 3); // Get more than needed for filtering

  const potentialMatches: UserMatchProfile[] = [];

  for (const { users: user, user_profiles: profile } of potentialUsers) {
    // Age filter
    if (profile.age < partnerPrefs.ageMin || profile.age > partnerPrefs.ageMax) {
      continue;
    }

    // Build full profile
    const matchProfile = await getUserMatchProfile(user.id);
    if (!matchProfile) continue;

    // Dealbreaker filter
    if (!passesDealbreakerFilters(currentUser, matchProfile)) {
      continue;
    }

    potentialMatches.push(matchProfile);

    if (potentialMatches.length >= limit) {
      break;
    }
  }

  return potentialMatches;
}

/**
 * Create matches with compatibility scores
 */
export async function createMatchesForUser(userId: string): Promise<void> {
  const potentialMatches = await findPotentialMatches(userId, 20);
  const currentUser = await getUserMatchProfile(userId);
  
  if (!currentUser) return;

  for (const match of potentialMatches) {
    const compatibility = calculateCompatibilityScore(currentUser, match);
    
    // Create match record
    const matchData: InsertMatch = {
      userId,
      matchedUserId: match.user.id,
      compatibilityScore: compatibility.totalScore,
      isLiked: false,
      isPassed: false,
      isMatched: false
    };

    const [createdMatch] = await db
      .insert(matches)
      .values(matchData)
      .returning();

    // Create compatibility details
    const compatibilityData: InsertCompatibilityDetails = {
      matchId: createdMatch.id,
      sharedInterestsScore: compatibility.sharedInterestsScore,
      ageCompatibilityScore: compatibility.ageCompatibilityScore,
      locationProximityScore: compatibility.locationProximityScore,
      genderOrientationScore: compatibility.genderOrientationScore,
      astrologyCompatibilityScore: compatibility.astrologyCompatibilityScore,
      sharedInterests: compatibility.sharedInterests
    };

    await db
      .insert(compatibilityDetails)
      .values(compatibilityData);
  }
}