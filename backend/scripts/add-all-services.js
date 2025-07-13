#!/usr/bin/env node
import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { addServiceToDatabase } from './add-service-to-db.js';
import { pool } from '../src/db/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Add all services from mcp-ports directory to the database
 * Usage: node add-all-services.js
 */

async function addAllServices() {
  try {
    const mcpPortsPath = join(__dirname, '../../mcp-ports');
    
    console.log('🔍 Scanning mcp-ports directory for services...');
    
    // Get all directories in mcp-ports
    const entries = readdirSync(mcpPortsPath);
    const serviceDirs = entries.filter(entry => {
      const fullPath = join(mcpPortsPath, entry);
      return statSync(fullPath).isDirectory();
    });

    console.log(`📁 Found ${serviceDirs.length} potential service directories:`);
    serviceDirs.forEach(dir => console.log(`   - ${dir}`));
    
    if (serviceDirs.length === 0) {
      console.log('⚠️  No service directories found in mcp-ports/');
      return;
    }

    // Process each service
    const results = {
      added: [],
      skipped: [],
      failed: []
    };

    for (const serviceName of serviceDirs) {
      console.log(`\n📋 Processing ${serviceName}...`);
      
      try {
        // Check if service already exists
        const existingService = await pool.query(
          'SELECT mcp_service_name FROM mcp_table WHERE mcp_service_name = $1',
          [serviceName]
        );

        if (existingService.rows.length > 0) {
          console.log(`⚠️  ${serviceName} already exists, skipping...`);
          results.skipped.push(serviceName);
          continue;
        }

        // Try to add the service
        await addServiceToDatabase(serviceName);
        results.added.push(serviceName);
        
      } catch (error) {
        console.error(`❌ Failed to add ${serviceName}: ${error.message}`);
        results.failed.push({ service: serviceName, error: error.message });
      }
    }

    // Summary report
    console.log('\n🎯 BATCH PROCESSING SUMMARY');
    console.log('===========================');
    console.log(`✅ Successfully added: ${results.added.length}`);
    if (results.added.length > 0) {
      results.added.forEach(service => console.log(`   - ${service}`));
    }
    
    console.log(`⚠️  Skipped (already exist): ${results.skipped.length}`);
    if (results.skipped.length > 0) {
      results.skipped.forEach(service => console.log(`   - ${service}`));
    }
    
    console.log(`❌ Failed: ${results.failed.length}`);
    if (results.failed.length > 0) {
      results.failed.forEach(item => console.log(`   - ${item.service}: ${item.error}`));
    }

    console.log(`\n📊 Total processed: ${serviceDirs.length} services`);

  } catch (error) {
    console.error('❌ Batch processing failed:', error.message);
    process.exit(1);
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting batch service registration...\n');
  
  addAllServices()
    .then(() => {
      console.log('\n🎉 Batch processing complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Batch processing failed:', error.message);
      process.exit(1);
    })
    .finally(() => {
      pool.end();
    });
}