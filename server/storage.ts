import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);
const scryptAsync = promisify(scrypt);

// Storage interface
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.Store;
  initializeAdmin(): Promise<void>;
}

// Implementation with PostgreSQL database
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
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

  // Function to initialize admin user or reset password
  async initializeAdmin(): Promise<void> {
    // Helper function to hash password
    const hashPassword = async (password: string) => {
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      return `${buf.toString("hex")}.${salt}`;
    };
    
    // Set the admin password to 'diosmio'
    const adminPassword = "diosmio";
    
    // Check if admin user exists
    const existingAdmin = await this.getUserByUsername("admin");
    
    if (!existingAdmin) {
      // Create admin user with password 'diosmio'
      const adminUser: InsertUser = {
        username: "admin",
        password: await hashPassword(adminPassword)
      };
      
      await this.createUser(adminUser);
      console.log("Admin user created successfully");
    } else {
      // Update existing admin password to 'diosmio'
      try {
        await db
          .update(users)
          .set({
            password: await hashPassword(adminPassword)
          })
          .where(eq(users.username, "admin"));
        console.log("Admin user password updated to 'diosmio'");
      } catch (error) {
        console.error("Error updating admin password:", error);
      }
    }
  }
}

export const storage = new DatabaseStorage();
