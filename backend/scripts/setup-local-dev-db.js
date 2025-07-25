#!/usr/bin/env node
// @ts-check

/**
 * Local Development Database Setup Script
 * @fileoverview Sets up database schema changes needed for local development
 */

import { db } from '../src/db/connection.js';
import { isLocalMode } from '../src/local_development/config/localMode.js';

/**
 * Add password_hash column for local development
 */
async function addPasswordHashColumn() {
    try {
        console.log('🔍 Checking if password_hash column exists...');
        
        // Check if column already exists
        const checkQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'password_hash'
        `;
        
        const checkResult = await db.query(checkQuery);
        
        if (checkResult.rows.length > 0) {
            console.log('✅ password_hash column already exists');
            return true;
        }
        
        console.log('➕ Adding password_hash column...');
        
        // Add the column
        const alterQuery = `
            ALTER TABLE users 
            ADD COLUMN password_hash VARCHAR(255) NULL
        `;
        
        await db.query(alterQuery);
        
        // Add comment
        const commentQuery = `
            COMMENT ON COLUMN users.password_hash IS 'Password hash for local development authentication only'
        `;
        
        await db.query(commentQuery);
        
        // Add indexes for performance
        const indexQuery1 = `
            CREATE INDEX IF NOT EXISTS idx_users_password_hash 
            ON users(password_hash) WHERE password_hash IS NOT NULL
        `;
        
        const indexQuery2 = `
            CREATE INDEX IF NOT EXISTS idx_users_with_password 
            ON users(email) WHERE password_hash IS NOT NULL
        `;
        
        await db.query(indexQuery1);
        await db.query(indexQuery2);
        
        console.log('✅ Successfully added password_hash column and indexes');
        return true;
        
    } catch (error) {
        console.error('❌ Error adding password_hash column:', error.message);
        return false;
    }
}

/**
 * Main setup function
 */
async function main() {
    console.log('🔧 BruhMCP Local Development Database Setup\n');
    
    // Check if local mode is enabled
    if (!isLocalMode()) {
        console.log('❌ Error: LOCAL_DEV=true not set in environment');
        console.log('💡 This script only runs in local development mode');
        console.log('💡 Set LOCAL_DEV=true and try again');
        process.exit(1);
    }
    
    console.log('✅ Local development mode detected');
    console.log('🗄️  Setting up database for local development...\n');
    
    // Add password hash column
    const success = await addPasswordHashColumn();
    
    if (success) {
        console.log('\n🎉 Local development database setup complete!');
        console.log('💡 You can now use: npm run auth:set-password');
    } else {
        console.log('\n❌ Database setup failed');
        process.exit(1);
    }
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
    console.error('\n💥 Unexpected error:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('\n💥 Database error:', reason);
    process.exit(1);
});

// Run the setup
main().catch((error) => {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
});