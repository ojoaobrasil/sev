import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User, InsertUser } from "@shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Define the user type for passport
import type { User as UserType } from '@shared/schema';

declare global {
  namespace Express {
    // Define user interface using the existing type
    interface User extends UserType {}
  }
}

const scryptAsync = promisify(scrypt);

// Hash the password for storage
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare stored hashed password with provided password
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Ensure admin user exists in database
  storage.initializeAdmin().catch(err => {
    console.error("Error initializing admin user:", err);
  });

  // Configure session
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "cyberpunk-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy for authentication
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        // Find user by username
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'ACCESS DENIED: Usuário não encontrado' });
        }
        
        // Verify password
        const isPasswordValid = await comparePasswords(password, user.password);
        if (isPasswordValid) {
          return done(null, user);
        }
        
        return done(null, false, { message: 'ACCESS DENIED: Senha inválida' });
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Serialize user to the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }
      
      // Create user with hashed password
      const hashedPassword = await hashPassword(password);
      const userData: InsertUser = {
        username,
        password: hashedPassword
      };
      
      const newUser = await storage.createUser(userData);
      
      // Log in the newly created user
      req.login(newUser, (err) => {
        if (err) return next(err);
        return res.status(201).json(newUser);
      });
    } catch (error) {
      next(error);
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ 
          message: info?.message || "Falha na autenticação. Credenciais inválidas." 
        });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    res.json(req.user);
  });
}
