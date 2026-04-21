import * as SQLite from 'expo-sqlite';
import { Society, Member, Payment, DashboardMetrics } from '../types';

export class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    // Open the DB synchronously (React Native SQLite Next approach in Expo SDK 50+)
    this.db = SQLite.openDatabaseSync('society_khata.db');
    this.init();
  }

  /**
   * Initializes the DB Schema. We use PRAGMA for basic SQLCipher integration
   * via community patterns or standard SQLite if native SQLCipher isn't active.
   */
  private init() {
    this.db.execSync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS societies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        default_amount REAL NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        society_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        flat_number TEXT NOT NULL,
        phone TEXT NOT NULL,
        is_paid INTEGER DEFAULT 0,
        FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        mode TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      );
    `);
  }

  // ==== SOCIETY METRICS & CRUD ====
  
  public getOrCreateSociety(name: string, defaultAmount: number): Society {
    const existing = this.db.getFirstSync<Society>('SELECT * FROM societies LIMIT 1');
    if (existing) return existing;

    const result = this.db.runSync(
      'INSERT INTO societies (name, default_amount, created_at) VALUES (?, ?, ?)',
      [name, defaultAmount, new Date().toISOString()]
    );
    return this.db.getFirstSync<Society>('SELECT * FROM societies WHERE id = ?', [result.lastInsertRowId])!;
  }

  // ==== MEMBER OPERATIONS ====

  public getMembers(societyId: number): Member[] {
    return this.db.getAllSync<Member>('SELECT * FROM members WHERE society_id = ? ORDER BY flat_number ASC', [societyId]);
  }

  public addMember(societyId: number, name: string, flat_number: string, phone: string): Member {
    const result = this.db.runSync(
      'INSERT INTO members (society_id, name, flat_number, phone, is_paid) VALUES (?, ?, ?, ?, 0)',
      [societyId, name, flat_number, phone]
    );
    return { id: result.lastInsertRowId, society_id: societyId, name, flat_number, phone, is_paid: 0 };
  }

  public updateMemberPaidStatus(memberId: number, isPaid: number) {
    this.db.runSync('UPDATE members SET is_paid = ? WHERE id = ?', [isPaid, memberId]);
  }

  // ==== PAYMENT OPERATIONS ====

  public addPayment(memberId: number, amount: number, mode: 'UPI' | 'CASH'): Payment {
    const timestamp = new Date().toISOString();
    const result = this.db.runSync(
      'INSERT INTO payments (member_id, amount, mode, timestamp) VALUES (?, ?, ?, ?)',
      [memberId, amount, mode, timestamp]
    );
    
    // Auto-update member to paid
    this.updateMemberPaidStatus(memberId, 1);

    return { id: result.lastInsertRowId, member_id: memberId, amount, mode, timestamp };
  }

  public getDashboardMetrics(societyId: number): DashboardMetrics {
    const members = this.getMembers(societyId);
    let totalCollected = 0;
    
    const payments = this.db.getAllSync<{ amount: number }>(
      'SELECT amount FROM payments p JOIN members m ON p.member_id = m.id WHERE m.society_id = ?',
      [societyId]
    );
    
    payments.forEach(p => totalCollected += p.amount);

    const defaultAmount = this.db.getFirstSync<{default_amount: number}>('SELECT default_amount FROM societies WHERE id = ?', [societyId])?.default_amount || 0;
    
    const paidCount = members.filter(m => m.is_paid === 1).length;
    const pendingCount = members.length - paidCount;
    const totalPending = pendingCount * defaultAmount;
    
    const paidPercentage = members.length > 0 ? (paidCount / members.length) * 100 : 0;

    return { totalCollected, totalPending, paidPercentage };
  }
}

export const dbService = new DatabaseService();
