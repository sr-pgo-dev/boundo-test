import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { completeOnboardingSchema } from "@shared/schema";
import { z } from "zod";

// Extend Request type to include userId
interface AuthenticatedRequest extends Request {
  userId: string;
}

// Configure multer for photo uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `photo-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: {
    fileSize: 15 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware (mock - replace with real auth)
  const requireAuth = (req: AuthenticatedRequest, res: any, next: any) => {
    // Mock user ID for development - replace with real session/JWT auth
    req.userId = "mock-fe-user-id";
    next();
  };

  // Location endpoints
  app.get("/api/countries", async (req, res) => {
    try {
      const countries = await storage.getCountries();
      res.json(countries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch countries" });
    }
  });

  app.get("/api/states/:country", async (req, res) => {
    try {
      const { country } = req.params;
      const states = await storage.getStates(country);
      res.json(states);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch states" });
    }
  });

  app.get("/api/cities/:country/:state", async (req, res) => {
    try {
      const { country, state } = req.params;
      const cities = await storage.getCities(country, state);
      res.json(cities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  // Onboarding endpoints
  app.post("/api/onboarding/complete", requireAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = req.userId;
      const validatedData = completeOnboardingSchema.parse(req.body);
      
      // Validate age range
      if (validatedData.ageMin >= validatedData.ageMax) {
        return res.status(400).json({ message: "Minimum age must be less than maximum age" });
      }
      
      // Validate birthdate age
      const birthDate = new Date(validatedData.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear() - 
        (today.getMonth() < birthDate.getMonth() || 
         (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
      
      if (age < 18 || age > 65) {
        return res.status(400).json({ message: "Age must be between 18 and 65" });
      }

      await storage.completeOnboarding(userId, validatedData);
      res.json({ message: "Onboarding completed successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Onboarding error:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Photo upload endpoints
  app.post("/api/photos/upload", requireAuth, upload.single('photo'), async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = req.userId;
      const file = req.file;
      const { orderIndex } = req.body;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!orderIndex || orderIndex < 1 || orderIndex > 3) {
        return res.status(400).json({ message: "Invalid order index. Must be 1, 2, or 3" });
      }

      const photo = await storage.createPhoto(userId, {
        filename: file.filename,
        url: `/uploads/${file.filename}`,
        orderIndex: parseInt(orderIndex),
      });

      res.json(photo);
    } catch (error) {
      console.error("Photo upload error:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  app.get("/api/photos", requireAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = req.userId;
      const photos = await storage.getUserPhotos(userId);
      res.json(photos);
    } catch (error) {
      console.error("Fetch photos error:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.delete("/api/photos/:photoId", requireAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = req.userId;
      const { photoId } = req.params;
      await storage.deletePhoto(photoId, userId);
      res.json({ message: "Photo deleted successfully" });
    } catch (error) {
      console.error("Delete photo error:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // User profile endpoints
  app.get("/api/profile", requireAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      const profile = await storage.getUserProfile(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user, profile });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Matching endpoints
  app.get("/api/matches", requireAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit as string) || 10;
      const matches = await storage.getMatches(userId, limit);
      res.json(matches);
    } catch (error) {
      console.error("Get matches error:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.post("/api/matches/:matchId/like", requireAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = req.userId;
      const { matchId } = req.params;
      
      await storage.updateMatch(matchId, { isLiked: true });
      
      // TODO: Check for mutual like and create match
      
      res.json({ message: "Match liked successfully" });
    } catch (error) {
      console.error("Like match error:", error);
      res.status(500).json({ message: "Failed to like match" });
    }
  });

  app.post("/api/matches/:matchId/pass", requireAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = req.userId;
      const { matchId } = req.params;
      
      await storage.updateMatch(matchId, { isPassed: true });
      
      res.json({ message: "Match passed successfully" });
    } catch (error) {
      console.error("Pass match error:", error);
      res.status(500).json({ message: "Failed to pass match" });
    }
  });

  app.post("/api/matches/:matchId/reveal-photo", requireAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = req.userId;
      const { matchId } = req.params;
      const { photoId } = req.body;

      if (!photoId) {
        return res.status(400).json({ message: "Photo ID is required" });
      }

      // Get match details to find the other user
      const matches = await storage.getMatches(userId, 1);
      const match = matches.find(m => m.id === matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      // Check if compatibility is high enough (68% threshold)
      if (match.compatibilityScore < 68) {
        return res.status(403).json({ 
          message: "Compatibility score must be at least 68% to reveal photos" 
        });
      }

      // Create photo reveal
      await storage.createPhotoReveal({
        matchId,
        revealedByUserId: userId,
        revealedToUserId: match.matchedUserId,
        photoId
      });

      res.json({ message: "Photo revealed successfully" });
    } catch (error) {
      console.error("Reveal photo error:", error);
      res.status(500).json({ message: "Failed to reveal photo" });
    }
  });

  // Astrology endpoints
  app.get("/api/astrology", requireAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = req.userId;
      const astrology = await storage.getUserAstrology(userId);
      res.json(astrology);
    } catch (error) {
      console.error("Get astrology error:", error);
      res.status(500).json({ message: "Failed to fetch astrology" });
    }
  });

  app.put("/api/astrology", requireAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = req.userId;
      const { enableAstrologyMatching } = req.body;
      
      await storage.updateUserAstrology(userId, { enableAstrologyMatching });
      
      res.json({ message: "Astrology preferences updated successfully" });
    } catch (error) {
      console.error("Update astrology error:", error);
      res.status(500).json({ message: "Failed to update astrology preferences" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
