import { users, type User, type InsertUser, resumes, type Resume, type InsertResume } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface with CRUD methods for the application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resume methods
  getResume(id: number): Promise<Resume | undefined>;
  getResumesByUserId(userId: number): Promise<Resume[]>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, resume: Partial<InsertResume>): Promise<Resume | undefined>;
  deleteResume(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Resume methods
  async getResume(id: number): Promise<Resume | undefined> {
    const result = await db.select().from(resumes).where(eq(resumes.id, id)).limit(1);
    return result[0];
  }
  
  async getResumesByUserId(userId: number): Promise<Resume[]> {
    // For now returning all resumes as we don't have a userId field in the schema
    return await db.select().from(resumes);
  }
  
  async createResume(insertResume: InsertResume): Promise<Resume> {
    const [resume] = await db.insert(resumes).values(insertResume).returning();
    return resume;
  }
  
  async updateResume(id: number, resumeUpdate: Partial<InsertResume>): Promise<Resume | undefined> {
    const existingResume = await this.getResume(id);
    
    if (!existingResume) {
      return undefined;
    }
    
    const [updatedResume] = await db
      .update(resumes)
      .set(resumeUpdate)
      .where(eq(resumes.id, id))
      .returning();
    
    return updatedResume;
  }
  
  async deleteResume(id: number): Promise<boolean> {
    const result = await db.delete(resumes).where(eq(resumes.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
