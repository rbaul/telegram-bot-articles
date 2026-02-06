import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables BEFORE importing database
dotenv.config();

async function runMigration() {
    try {
        console.log('Starting database migration...');
        
        // Import database after dotenv is loaded
        const { default: sql } = require('./database');
        
        // Read schema from src directory (not dist, since .sql files aren't compiled)
        const schemaPath = path.join(__dirname, '../../src/db/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        
        const statements = schemaSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        
        for (const statement of statements) {
            await sql.unsafe(statement);
        }
        
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
