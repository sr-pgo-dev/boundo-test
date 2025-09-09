import { 
  users, 
  userProfiles,
  interests,
  lifestylePreferences,
  valuesAndBeliefs,
  dealbreakers,
  partnerPreferences,
  photos,
  userAstrology,
  matches,
  compatibilityDetails,
  photoReveals,
  type User, 
  type InsertUser,
  type UserProfile,
  type InsertUserProfile,
  type Interest,
  type InsertInterest,
  type LifestylePreferences,
  type InsertLifestylePreferences,
  type ValuesAndBeliefs,
  type InsertValuesAndBeliefs,
  type Dealbreakers,
  type InsertDealbreakers,
  type PartnerPreferences,
  type InsertPartnerPreferences,
  type Photo,
  type InsertPhoto,
  type UserAstrology,
  type InsertUserAstrology,
  type Match,
  type InsertMatch,
  type CompatibilityDetails,
  type PhotoReveal,
  type InsertPhotoReveal,
  type CompleteOnboardingData
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { calculateAstrologySign } from "./astrology";
import { createMatchesForUser, getUserMatchProfile, type UserMatchProfile } from "./matching";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOnboardingStatus(userId: string, completed: boolean): Promise<void>;
  
  // Profile methods
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(userId: string, profile: InsertUserProfile): Promise<UserProfile>;
  
  // Complete onboarding
  completeOnboarding(userId: string, data: CompleteOnboardingData): Promise<void>;
  
  // Photo methods
  createPhoto(userId: string, photo: InsertPhoto): Promise<Photo>;
  getUserPhotos(userId: string): Promise<Photo[]>;
  deletePhoto(photoId: string, userId: string): Promise<void>;
  
  // Location methods
  getCountries(): Promise<string[]>;
  getStates(country: string): Promise<string[]>;
  getCities(country: string, state: string): Promise<string[]>;
  
  // Astrology methods
  createUserAstrology(userId: string, astrology: InsertUserAstrology): Promise<UserAstrology>;
  getUserAstrology(userId: string): Promise<UserAstrology | undefined>;
  updateUserAstrology(userId: string, astrology: Partial<InsertUserAstrology>): Promise<void>;
  
  // Matching methods
  getMatches(userId: string, limit?: number): Promise<(Match & { matchedUser: UserProfile; compatibility: CompatibilityDetails })[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(matchId: string, updates: Partial<InsertMatch>): Promise<void>;
  
  // Photo reveal methods
  createPhotoReveal(reveal: InsertPhotoReveal): Promise<PhotoReveal>;
  getPhotoReveals(matchId: string): Promise<PhotoReveal[]>;
  isPhotoRevealed(userId: string, photoId: string, viewerUserId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserOnboardingStatus(userId: string, completed: boolean): Promise<void> {
    await db
      .update(users)
      .set({ 
        onboardingCompleted: completed,
        onboardingAt: completed ? new Date() : null
      })
      .where(eq(users.id, userId));
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async createUserProfile(userId: string, profile: InsertUserProfile): Promise<UserProfile> {
    // Calculate age from birthdate
    const birthDate = new Date(profile.birthdate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear() - 
      (today.getMonth() < birthDate.getMonth() || 
       (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);

    const [newProfile] = await db
      .insert(userProfiles)
      .values({
        ...profile,
        userId,
        age,
      })
      .returning();
    return newProfile;
  }

  async completeOnboarding(userId: string, data: CompleteOnboardingData): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Create user profile
      const birthDate = new Date(data.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear() - 
        (today.getMonth() < birthDate.getMonth() || 
         (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);

      await tx.insert(userProfiles).values({
        userId,
        name: data.name,
        birthdate: data.birthdate,
        age,
        gender: data.gender,
        orientation: data.orientation,
        country: data.country,
        state: data.state,
        city: data.city,
      });

      // 2. Insert interests
      if (data.interests.length > 0) {
        await tx.insert(interests).values(
          data.interests.map(interest => ({
            userId,
            category: interest.category,
            interest: interest.interest,
          }))
        );
      }

      // 3. Insert lifestyle preferences
      await tx.insert(lifestylePreferences).values({
        userId,
        exerciseTypes: data.exerciseTypes,
        diet: data.diet,
        travel: data.travel,
        socialActivities: data.socialActivities,
        socialHabits: data.socialHabits,
      });

      // 4. Insert values and beliefs
      await tx.insert(valuesAndBeliefs).values({
        userId,
        coreValues: data.coreValues,
        kids: data.kids,
        growthGoals: data.growthGoals,
        intimacyPreferences: data.intimacyPreferences,
        petPreferences: data.petPreferences,
      });

      // 5. Insert dealbreakers
      await tx.insert(dealbreakers).values({
        userId,
        dealbreakers: data.dealbreakers,
      });

      // 6. Insert partner preferences
      await tx.insert(partnerPreferences).values({
        userId,
        ageMin: data.ageMin,
        ageMax: data.ageMax,
        distance: data.distance,
        distanceUnit: data.distanceUnit,
        longDistance: data.longDistance,
        meetingTimeline: data.meetingTimeline,
        heightPreference: data.heightPreference,
        bodyTypePreference: data.bodyTypePreference,
        ethnicityPreferences: data.ethnicityPreferences,
        dealbreakers: data.partnerDealbreakers,
      });

      // 7. Create astrology profile
      const sunSign = calculateAstrologySign(data.birthdate);
      await tx.insert(userAstrology).values({
        userId,
        sunSign,
        enableAstrologyMatching: false, // Default to disabled, user can enable later
      });

      // 8. Update user onboarding status
      await tx
        .update(users)
        .set({ 
          onboardingCompleted: true,
          onboardingAt: new Date()
        })
        .where(eq(users.id, userId));
    });

    // After successful onboarding, create matches
    await createMatchesForUser(userId);
  }

  async createPhoto(userId: string, photo: InsertPhoto): Promise<Photo> {
    const [newPhoto] = await db
      .insert(photos)
      .values({
        ...photo,
        userId,
      })
      .returning();
    return newPhoto;
  }

  async getUserPhotos(userId: string): Promise<Photo[]> {
    return await db
      .select()
      .from(photos)
      .where(and(eq(photos.userId, userId), eq(photos.isActive, true)))
      .orderBy(photos.orderIndex);
  }

  async deletePhoto(photoId: string, userId: string): Promise<void> {
    await db
      .update(photos)
      .set({ isActive: false })
      .where(and(eq(photos.id, photoId), eq(photos.userId, userId)));
  }

  // Mock location methods - in production, these would use real APIs
  async getCountries(): Promise<string[]> {
    return ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'];
  }

  async getStates(country: string): Promise<string[]> {
    const statesMap: Record<string, string[]> = {
      'United States': ['California', 'New York', 'Texas', 'Florida', 'Illinois', 'Pennsylvania'],
      'Canada': ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan'],
      'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
      'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania'],
    };
    return statesMap[country] || [];
  }

  async getCities(country: string, state: string): Promise<string[]> {
    const citiesMap: Record<string, Record<string, string[]>> = {
      'United States': {
        'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'Oakland'],
        'New York': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse'],
        'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
        'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Tallahassee'],
      },
      'Canada': {
        'Ontario': ['Toronto', 'Ottawa', 'Hamilton', 'London', 'Windsor'],
        'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil'],
        'British Columbia': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond'],
      },
    };
    return citiesMap[country]?.[state] || [];
  }

  // Astrology methods
  async createUserAstrology(userId: string, astrology: InsertUserAstrology): Promise<UserAstrology> {
    const [newAstrology] = await db
      .insert(userAstrology)
      .values({
        ...astrology,
        userId
      })
      .returning();
    return newAstrology;
  }

  async getUserAstrology(userId: string): Promise<UserAstrology | undefined> {
    const [astrology] = await db
      .select()
      .from(userAstrology)
      .where(eq(userAstrology.userId, userId));
    return astrology || undefined;
  }

  async updateUserAstrology(userId: string, updates: Partial<InsertUserAstrology>): Promise<void> {
    await db
      .update(userAstrology)
      .set(updates)
      .where(eq(userAstrology.userId, userId));
  }

  // Matching methods
  async getMatches(userId: string, limit = 10): Promise<(Match & { matchedUser: UserProfile & { photos: Photo[] }; compatibility: CompatibilityDetails })[]> {
    // First get the current user's gender to filter matches properly
    const [currentUser] = await db
      .select({ gender: userProfiles.gender })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (!currentUser) {
      return [];
    }

    // Determine which gender they should see
    const targetGender = currentUser.gender === 'male' ? 'female' : 'male';

    const userMatches = await db
      .select({
        match: matches,
        matchedUser: userProfiles,
        compatibility: compatibilityDetails
      })
      .from(matches)
      .innerJoin(userProfiles, eq(matches.matchedUserId, userProfiles.userId))
      .innerJoin(compatibilityDetails, eq(matches.id, compatibilityDetails.matchId))
      .where(
        and(
          eq(matches.userId, userId),
          eq(userProfiles.gender, targetGender) // Filter by target gender
        )
      )
      .orderBy(desc(matches.compatibilityScore))
      .limit(limit);

    // Get photos for each matched user
    const results = [];
    for (const row of userMatches) {
      const userPhotos = await db
        .select()
        .from(photos)
        .where(eq(photos.userId, row.matchedUser.userId))
        .orderBy(photos.orderIndex);
      
      results.push({
        ...row.match,
        matchedUser: {
          ...row.matchedUser,
          photos: userPhotos
        },
        compatibility: row.compatibility
      });
    }

    return results;
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db
      .insert(matches)
      .values(match)
      .returning();
    return newMatch;
  }

  async updateMatch(matchId: string, updates: Partial<InsertMatch>): Promise<void> {
    await db
      .update(matches)
      .set(updates)
      .where(eq(matches.id, matchId));
  }

  // Photo reveal methods
  async createPhotoReveal(reveal: InsertPhotoReveal): Promise<PhotoReveal> {
    const [newReveal] = await db
      .insert(photoReveals)
      .values(reveal)
      .returning();
    return newReveal;
  }

  async getPhotoReveals(matchId: string): Promise<PhotoReveal[]> {
    return await db
      .select()
      .from(photoReveals)
      .where(eq(photoReveals.matchId, matchId));
  }

  async isPhotoRevealed(userId: string, photoId: string, viewerUserId: string): Promise<boolean> {
    const [reveal] = await db
      .select()
      .from(photoReveals)
      .where(
        and(
          eq(photoReveals.revealedByUserId, userId),
          eq(photoReveals.revealedToUserId, viewerUserId),
          eq(photoReveals.photoId, photoId)
        )
      );
    return !!reveal;
  }
}

export const storage = new DatabaseStorage();
