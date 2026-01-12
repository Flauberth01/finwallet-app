import * as SQLite from 'expo-sqlite';
import { SCHEMA_STATEMENTS, SCHEMA_VERSION } from './schema';
import { DEFAULT_CATEGORIES } from '@/constants';
import { generateUUID } from '@/utils/uuid';

const DATABASE_NAME = 'finwallet.db';

let db: SQLite.SQLiteDatabase | null = null;

// Get database instance (singleton)
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (db) return db;

    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    return db;
}

// Initialize database with schema and seed data
export async function initializeDatabase(): Promise<void> {
    const database = await getDatabase();

    // Enable foreign keys
    await database.execAsync('PRAGMA foreign_keys = ON;');

    // Run all schema statements
    for (const statement of SCHEMA_STATEMENTS) {
        await database.execAsync(statement);
    }

    // Seed default categories if empty
    await seedDefaultCategories(database);

    console.log('Database initialized successfully');
}

// Seed default categories
async function seedDefaultCategories(database: SQLite.SQLiteDatabase): Promise<void> {
    const result = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM categories'
    );

    if (result && result.count > 0) {
        return; // Categories already exist
    }

    console.log('Seeding default categories...');

    for (const category of DEFAULT_CATEGORIES) {
        const id = generateUUID();
        await database.runAsync(
            `INSERT INTO categories (id, name, icon, color, type, is_custom, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, category.name, category.icon, category.color, category.type, category.is_custom ? 1 : 0, category.is_active ? 1 : 0]
        );
    }

    console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories`);
}

// Close database connection
export async function closeDatabase(): Promise<void> {
    if (db) {
        await db.closeAsync();
        db = null;
    }
}

// Reset database (for development/testing)
export async function resetDatabase(): Promise<void> {
    const database = await getDatabase();

    await database.execAsync(`
    DROP TABLE IF EXISTS budgets;
    DROP TABLE IF EXISTS goal_deposits;
    DROP TABLE IF EXISTS goals;
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS categories;
  `);

    await initializeDatabase();
}

// Clear all user data (keeps categories)
export async function clearAllData(): Promise<void> {
    const database = await getDatabase();

    await database.execAsync(`
    DELETE FROM budgets;
    DELETE FROM goal_deposits;
    DELETE FROM goals;
    DELETE FROM transactions;
  `);

    console.log('All user data cleared');
}
