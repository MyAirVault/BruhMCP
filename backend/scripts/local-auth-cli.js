#!/usr/bin/env node
// @ts-check

/**
 * Local Development Authentication CLI Tool
 * @fileoverview Command-line tool for managing local development authentication
 */

const { createInterface } = require('readline');
const { localUserService } = require('../src/local_development/services/localUserService.js');
const { isLocalMode, getDefaultLocalUserEmail } = require('../src/local_development/config/localMode.js');

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Prompt for password input (hidden)
 * @param {string} question 
 * @returns {Promise<string>}
 */
function promptPassword(question) {
    return new Promise((resolve) => {
        process.stdout.write(question);
        process.stdin.setRawMode(true);
        
        let password = '';
        
        const onData = (char) => {
            char = char.toString();
            
            if (char === '\n' || char === '\r' || char === '\u0004') {
                process.stdin.setRawMode(false);
                process.stdin.removeListener('data', onData);
                console.log();
                resolve(password);
            } else if (char === '\u0008' || char === '\u007f') {
                if (password.length > 0) {
                    password = password.slice(0, -1);
                    process.stdout.write('\b \b');
                }
            } else {
                password += char;
                process.stdout.write('*');
            }
        };
        
        process.stdin.on('data', onData);
    });
}

/**
 * Prompt for regular input
 * @param {string} question 
 * @returns {Promise<string>}
 */
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Display welcome message
 */
function displayWelcome() {
    console.log('🔧 BruhMCP Local Development Authentication CLI\n');
    console.log('📋 Manage user accounts and passwords for local development');
    console.log('━'.repeat(60));
}

/**
 * Display help information
 */
function displayHelp() {
    console.log('\n📖 Available Commands:');
    console.log('');
    console.log('  set-password    Set or update password for a user');
    console.log('  list-users      Show all users and their password status');
    console.log('  test-login      Test login credentials');
    console.log('  help            Show this help message');
    console.log('');
    console.log('💡 Usage Examples:');
    console.log('  node scripts/local-auth-cli.js set-password');
    console.log('  node scripts/local-auth-cli.js list-users');
    console.log('  npm run auth:set-password');
    console.log('  npm run auth:list-users');
    console.log('');
}

/**
 * Set password command
 */
async function setPasswordCommand() {
    console.log('🔐 Set User Password\n');
    
    // Get email
    let email = await prompt(`Enter email address (default: ${getDefaultLocalUserEmail()}): `);
    if (!email.trim()) {
        email = getDefaultLocalUserEmail();
    }
    
    if (!isValidEmail(email)) {
        console.log('❌ Invalid email address format');
        return false;
    }
    
    // Get password
    const password = await promptPassword('Enter new password (min 6 characters): ');
    if (password.length < 6) {
        console.log('❌ Password must be at least 6 characters long');
        return false;
    }
    
    // Confirm password
    const confirmPassword = await promptPassword('Confirm password: ');
    if (password !== confirmPassword) {
        console.log('❌ Passwords do not match');
        return false;
    }
    
    // Set password
    console.log('\n⏳ Setting password...');
    const result = await localUserService.setPasswordForEmail(email, password);
    
    if (result.success) {
        console.log(`✅ Password ${result.isNewUser ? 'set for new user' : 'updated for existing user'}: ${email}`);
        console.log(`🎉 You can now login with these credentials in the web interface`);
        return true;
    } else {
        console.log(`❌ Failed to set password: ${result.error}`);
        return false;
    }
}

/**
 * List users command
 */
async function listUsersCommand() {
    console.log('👥 User List\n');
    
    const result = await localUserService.listUsers();
    
    if (!result.success) {
        console.log(`❌ Failed to retrieve users: ${result.error}`);
        return false;
    }
    
    if (result.users.length === 0) {
        console.log('📭 No users found in the database');
        console.log('💡 Create a user by running: npm run auth:set-password');
        return true;
    }
    
    console.log(`Found ${result.users.length} user(s):\n`);
    
    result.users.forEach((user, index) => {
        const status = user.has_password ? '✅ Password Set' : '❌ No Password';
        const createdDate = new Date(user.created_at).toLocaleDateString();
        
        console.log(`${index + 1}. 📧 ${user.email}`);
        console.log(`   Status: ${status}`);
        console.log(`   Created: ${createdDate}`);
        console.log('');
    });
    
    return true;
}

/**
 * Test login command
 */
async function testLoginCommand() {
    console.log('🧪 Test Login Credentials\n');
    
    const email = await prompt('Enter email address: ');
    if (!isValidEmail(email)) {
        console.log('❌ Invalid email address format');
        return false;
    }
    
    const password = await promptPassword('Enter password: ');
    
    console.log('\n⏳ Testing credentials...');
    const result = await localUserService.verifyCredentials(email, password);
    
    if (result.success) {
        console.log(`✅ Login successful for: ${result.user.email}`);
        console.log(`👤 User ID: ${result.user.id}`);
        return true;
    } else {
        console.log(`❌ Login failed: ${result.message}`);
        
        if (result.error === 'PASSWORD_NOT_SET') {
            console.log('💡 Tip: Set a password using: npm run auth:set-password');
        }
        
        return false;
    }
}

/**
 * Main function
 */
async function main() {
    displayWelcome();

    // Check if local mode is enabled
    if (!isLocalMode()) {
        console.log('❌ Error: Local development mode not enabled');
        console.log('💡 Set LOCAL_DEV=true in your environment variables');
        console.log('💡 Or run: npm run dev:local');
        console.log('');
        process.exit(1);
    }

    const command = process.argv[2];
    let success = false;
    
    switch (command) {
        case 'set-password':
            success = await setPasswordCommand();
            break;
            
        case 'list-users':
            success = await listUsersCommand();
            break;
            
        case 'test-login':
            success = await testLoginCommand();
            break;
            
        case 'help':
        case '--help':
        case '-h':
            displayHelp();
            success = true;
            break;
            
        default:
            console.log('❌ Unknown command:', command || '(none)');
            displayHelp();
            success = false;
    }
    
    console.log('━'.repeat(60));
    rl.close();
    
    process.exit(success ? 0 : 1);
}

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
    console.error('\n💥 Unexpected error:', error.message);
    console.log('🔍 Please check your database connection and configuration');
    rl.close();
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('\n💥 Unhandled rejection:', reason);
    console.log('🔍 Please check your database connection and configuration');
    rl.close();
    process.exit(1);
});

// Run the CLI
main().catch((error) => {
    console.error('\n💥 CLI Error:', error.message);
    rl.close();
    process.exit(1);
});