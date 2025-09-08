import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const genderEnum = pgEnum('gender', ['male', 'female', 'non-binary', 'other']);
export const orientationEnum = pgEnum('orientation', ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other']);
export const dietEnum = pgEnum('diet', ['vegetarian', 'vegan', 'halal', 'kosher', 'keto', 'no-restrictions']);
export const travelEnum = pgEnum('travel', ['frequent', 'occasional', 'homebody', 'nomad']);
export const kidsEnum = pgEnum('kids', ['want-soon', 'eventually', 'maybe', 'dont-want', 'already-have', 'open-to-partner']);
export const meetingTimelineEnum = pgEnum('meeting_timeline', ['1-2-weeks', '1-month', '2-3-months', 'when-ready']);
export const heightPreferenceEnum = pgEnum('height_preference', ['shorter', 'similar', 'taller', 'no-preference']);
export const bodyTypeEnum = pgEnum('body_type', ['slim', 'athletic', 'average', 'curvy', 'plus-size', 'no-preference']);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingAt: timestamp("onboarding_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// User profiles table
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  birthdate: text("birthdate").notNull(), // YYYY-MM-DD format
  age: integer("age").notNull(),
  gender: genderEnum("gender").notNull(),
  orientation: orientationEnum("orientation").notNull(),
  country: text("country").notNull(),
  state: text("state").notNull(),
  city: text("city").notNull(),
  bio: text("bio"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Interests table
export const interests = pgTable("interests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // health, creative, intellectual, adventure, entertainment
  interest: text("interest").notNull(), // specific interest name
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Lifestyle preferences table
export const lifestylePreferences = pgTable("lifestyle_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseTypes: jsonb("exercise_types"), // array of exercise preferences
  diet: dietEnum("diet"),
  travel: travelEnum("travel"),
  socialActivities: jsonb("social_activities"), // array of social activity preferences
  socialHabits: jsonb("social_habits"), // drinking, cannabis, vaping with frequencies
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Values and beliefs table
export const valuesAndBeliefs = pgTable("values_and_beliefs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  coreValues: jsonb("core_values"), // array of up to 5 core values
  kids: kidsEnum("kids"),
  growthGoals: jsonb("growth_goals"), // array of growth goals
  intimacyPreferences: text("intimacy_preferences"),
  petPreferences: jsonb("pet_preferences"), // array of pet preferences
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Dealbreakers table
export const dealbreakers = pgTable("dealbreakers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dealbreakers: jsonb("dealbreakers").notNull(), // array of dealbreaker categories
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Partner preferences table
export const partnerPreferences = pgTable("partner_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ageMin: integer("age_min").notNull(),
  ageMax: integer("age_max").notNull(),
  distance: integer("distance").notNull(),
  distanceUnit: text("distance_unit").notNull().default('miles'),
  longDistance: boolean("long_distance").default(false),
  meetingTimeline: meetingTimelineEnum("meeting_timeline"),
  heightPreference: heightPreferenceEnum("height_preference"),
  bodyTypePreference: bodyTypeEnum("body_type_preference"),
  ethnicityPreferences: jsonb("ethnicity_preferences"),
  dealbreakers: jsonb("dealbreakers"), // partner-specific dealbreakers
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Photos table
export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  orderIndex: integer("order_index").notNull(), // 1, 2, 3
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  interests: many(interests),
  lifestylePreferences: one(lifestylePreferences, {
    fields: [users.id],
    references: [lifestylePreferences.userId],
  }),
  valuesAndBeliefs: one(valuesAndBeliefs, {
    fields: [users.id],
    references: [valuesAndBeliefs.userId],
  }),
  dealbreakers: one(dealbreakers, {
    fields: [users.id],
    references: [dealbreakers.userId],
  }),
  partnerPreferences: one(partnerPreferences, {
    fields: [users.id],
    references: [partnerPreferences.userId],
  }),
  photos: many(photos),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const interestsRelations = relations(interests, ({ one }) => ({
  user: one(users, {
    fields: [interests.userId],
    references: [users.id],
  }),
}));

export const lifestylePreferencesRelations = relations(lifestylePreferences, ({ one }) => ({
  user: one(users, {
    fields: [lifestylePreferences.userId],
    references: [users.id],
  }),
}));

export const valuesAndBeliefsRelations = relations(valuesAndBeliefs, ({ one }) => ({
  user: one(users, {
    fields: [valuesAndBeliefs.userId],
    references: [users.id],
  }),
}));

export const dealbreakersRelations = relations(dealbreakers, ({ one }) => ({
  user: one(users, {
    fields: [dealbreakers.userId],
    references: [users.id],
  }),
}));

export const partnerPreferencesRelations = relations(partnerPreferences, ({ one }) => ({
  user: one(users, {
    fields: [partnerPreferences.userId],
    references: [users.id],
  }),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  user: one(users, {
    fields: [photos.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  onboardingCompleted: true,
  onboardingAt: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  userId: true,
  age: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInterestSchema = createInsertSchema(interests).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertLifestylePreferencesSchema = createInsertSchema(lifestylePreferences).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertValuesAndBeliefsSchema = createInsertSchema(valuesAndBeliefs).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertDealbreakersSchema = createInsertSchema(dealbreakers).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertPartnerPreferencesSchema = createInsertSchema(partnerPreferences).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  userId: true,
  createdAt: true,
});

// Complete onboarding data schema
export const completeOnboardingSchema = z.object({
  // Step 1: Basic Info
  name: z.string().min(1, "Name is required"),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid birthdate format"),
  gender: z.enum(['male', 'female', 'non-binary', 'other']),
  orientation: z.enum(['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other']),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  
  // Step 2: Interests
  interests: z.array(z.object({
    category: z.string(),
    interest: z.string(),
  })).min(1, "At least one interest is required"),
  
  // Step 3: Lifestyle
  exerciseTypes: z.array(z.string()),
  diet: z.enum(['vegetarian', 'vegan', 'halal', 'kosher', 'keto', 'no-restrictions']).optional(),
  travel: z.enum(['frequent', 'occasional', 'homebody', 'nomad']).optional(),
  socialActivities: z.array(z.string()),
  socialHabits: z.object({
    drinking: z.string().optional(),
    cannabis: z.string().optional(),
    vaping: z.string().optional(),
  }).optional(),
  
  // Step 4: Values
  coreValues: z.array(z.string()).max(5, "Maximum 5 core values allowed"),
  kids: z.enum(['want-soon', 'eventually', 'maybe', 'dont-want', 'already-have', 'open-to-partner']).optional(),
  growthGoals: z.array(z.string()),
  intimacyPreferences: z.string().optional(),
  petPreferences: z.array(z.string()),
  
  // Step 5: Dealbreakers
  dealbreakers: z.array(z.string()),
  
  // Step 6: Partner Preferences
  ageMin: z.number().min(18).max(65),
  ageMax: z.number().min(18).max(65),
  distance: z.number().min(1).max(100),
  distanceUnit: z.enum(['miles', 'km']).default('miles'),
  longDistance: z.boolean().default(false),
  meetingTimeline: z.enum(['1-2-weeks', '1-month', '2-3-months', 'when-ready']).optional(),
  heightPreference: z.enum(['shorter', 'similar', 'taller', 'no-preference']).optional(),
  bodyTypePreference: z.enum(['slim', 'athletic', 'average', 'curvy', 'plus-size', 'no-preference']).optional(),
  ethnicityPreferences: z.array(z.string()).optional(),
  partnerDealbreakers: z.array(z.string()).optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Interest = typeof interests.$inferSelect;
export type InsertInterest = z.infer<typeof insertInterestSchema>;
export type LifestylePreferences = typeof lifestylePreferences.$inferSelect;
export type InsertLifestylePreferences = z.infer<typeof insertLifestylePreferencesSchema>;
export type ValuesAndBeliefs = typeof valuesAndBeliefs.$inferSelect;
export type InsertValuesAndBeliefs = z.infer<typeof insertValuesAndBeliefsSchema>;
export type Dealbreakers = typeof dealbreakers.$inferSelect;
export type InsertDealbreakers = z.infer<typeof insertDealbreakersSchema>;
export type PartnerPreferences = typeof partnerPreferences.$inferSelect;
export type InsertPartnerPreferences = z.infer<typeof insertPartnerPreferencesSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type CompleteOnboardingData = z.infer<typeof completeOnboardingSchema>;
