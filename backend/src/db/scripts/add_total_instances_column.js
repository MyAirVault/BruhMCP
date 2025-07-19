import { pool } from '../config.js';

async function addTotalInstancesColumn() {
	try {
		console.log('🔄 Adding total_instances_created column...');

		// Add the column if it doesn't exist
		await pool.query(`
			ALTER TABLE user_plans 
			ADD COLUMN IF NOT EXISTS total_instances_created INTEGER DEFAULT 0 NOT NULL
		`);

		console.log('✅ Column added successfully');

		// Backfill existing users' total_instances_created
		console.log('🔄 Backfilling existing users...');
		
		const result = await pool.query(`
			UPDATE user_plans 
			SET total_instances_created = (
				SELECT COUNT(*)
				FROM mcp_service_table ms
				WHERE ms.user_id = user_plans.user_id 
				AND ms.oauth_status = 'completed'
			)
			WHERE total_instances_created = 0
		`);

		console.log(`✅ Backfilled ${result.rowCount} user records`);

		// Create index if it doesn't exist
		await pool.query(`
			CREATE INDEX IF NOT EXISTS idx_user_plans_total_instances 
			ON user_plans(total_instances_created)
		`);

		console.log('✅ Index created successfully');
		console.log('🎉 Migration completed successfully!');

	} catch (error) {
		console.error('❌ Migration failed:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

addTotalInstancesColumn();