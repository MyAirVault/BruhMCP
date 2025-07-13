#!/usr/bin/env node
import { pool } from '../src/db/config.js';
import { randomUUID } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Add a service to the database from its config.json file
 * Usage: node add-service-to-db.js <service-name>
 * Example: node add-service-to-db.js figma
 */

async function addServiceToDatabase(serviceName) {
  try {
    // Construct path to config file
    const configPath = join(__dirname, '../../mcp-ports', serviceName, 'config.json');
    
    // Check if config file exists
    if (!existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }

    // Read and parse config file
    console.log(`📖 Reading config for ${serviceName}...`);
    const configContent = readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);

    // Validate required fields
    const requiredFields = ['name', 'displayName', 'port', 'auth'];
    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields in config: ${missingFields.join(', ')}`);
    }

    // Extract data from config
    const serviceData = {
      serviceName: config.name || serviceName,
      displayName: config.displayName,
      description: config.description || `${config.displayName} service`,
      port: config.port,
      authType: config.auth.type,
      iconPath: `/mcp-logos/${serviceName}.svg`
    };

    // Validate port number
    if (!Number.isInteger(serviceData.port) || serviceData.port < 49160 || serviceData.port > 49999) {
      throw new Error(`Invalid port ${serviceData.port}. Must be integer between 49160-49999`);
    }

    // Validate auth type and normalize
    const validAuthTypes = ['api_key', 'oauth', 'oauth2', 'basic_auth', 'bearer_token'];
    if (!validAuthTypes.includes(serviceData.authType)) {
      throw new Error(`Invalid auth type '${serviceData.authType}'. Must be: ${validAuthTypes.join(', ')}`);
    }

    // Normalize oauth2 to oauth for database storage
    if (serviceData.authType === 'oauth2') {
      serviceData.authType = 'oauth';
    }

    // Check if service already exists
    console.log(`🔍 Checking if ${serviceName} already exists...`);
    const existingService = await pool.query(
      'SELECT mcp_service_name FROM mcp_table WHERE mcp_service_name = $1',
      [serviceData.serviceName]
    );

    if (existingService.rows.length > 0) {
      console.log(`⚠️  Service '${serviceName}' already exists in database`);
      console.log('   Use --force flag to overwrite (not implemented yet)');
      return;
    }

    // Check for port conflicts
    console.log(`🚪 Checking for port conflicts on ${serviceData.port}...`);
    const portConflict = await pool.query(
      'SELECT mcp_service_name FROM mcp_table WHERE port = $1',
      [serviceData.port]
    );

    if (portConflict.rows.length > 0) {
      throw new Error(`Port ${serviceData.port} is already in use by service: ${portConflict.rows[0].mcp_service_name}`);
    }

    // Generate UUID for service ID
    const serviceId = randomUUID();

    // Insert service into database
    console.log(`📝 Adding ${serviceName} to database...`);
    const result = await pool.query(`
      INSERT INTO mcp_table (
        mcp_service_id, mcp_service_name, display_name, description, icon_url_path, 
        port, type, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `, [
      serviceId,
      serviceData.serviceName,
      serviceData.displayName,
      serviceData.description,
      serviceData.iconPath,
      serviceData.port,
      serviceData.authType,
      true
    ]);

    // Success output
    console.log(`✅ ${serviceData.displayName} added successfully!`);
    console.log('📊 Service details:');
    const row = result.rows[0];
    console.log(`   🆔 Service ID: ${row.mcp_service_id}`);
    console.log(`   📛 Service Name: ${row.mcp_service_name}`);
    console.log(`   🏷️  Display Name: ${row.display_name}`);
    console.log(`   🚪 Port: ${row.port}`);
    console.log(`   🔐 Auth Type: ${row.type}`);
    console.log(`   🎨 Icon Path: ${row.icon_url_path}`);
    console.log(`   ✅ Active: ${row.is_active}`);
    console.log(`   📝 Description: ${row.description}`);
    console.log(`   📅 Created: ${row.created_at}`);

  } catch (error) {
    console.error('❌ Error adding service to database:', error.message);
    process.exit(1);
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const serviceName = process.argv[2];
  
  if (!serviceName) {
    console.error('❌ Usage: node add-service-to-db.js <service-name>');
    console.error('   Example: node add-service-to-db.js figma');
    process.exit(1);
  }

  addServiceToDatabase(serviceName)
    .then(() => {
      console.log('\n🎉 Service registration complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Script failed:', error.message);
      process.exit(1);
    })
    .finally(() => {
      pool.end();
    });
}

export { addServiceToDatabase };