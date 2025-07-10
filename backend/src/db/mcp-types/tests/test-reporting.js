/**
 * Generate test report
 * @param {Array} results - Verification results
 * @returns {boolean} True if all tests passed
 */
export function generateTestReport(results) {
	console.log('\n📊 VERIFICATION REPORT');
	console.log('========================');

	const summary = {
		total: results.length,
		exists: results.filter(r => r.exists).length,
		compatible: results.filter(r => r.compatible).length,
		missing: results.filter(r => !r.exists).length,
		incompatible: results.filter(r => r.exists && !r.compatible).length,
	};

	console.log(`Total expected types: ${summary.total}`);
	console.log(`Types found: ${summary.exists}`);
	console.log(`Frontend compatible: ${summary.compatible}`);
	console.log(`Missing types: ${summary.missing}`);
	console.log(`Incompatible types: ${summary.incompatible}`);

	if (summary.missing > 0) {
		console.log('\n❌ Missing MCP types:');
		results.filter(r => !r.exists).forEach(r => console.log(`   - ${r.name}`));
	}

	if (summary.incompatible > 0) {
		console.log('\n⚠️  Incompatible MCP types:');
		results.filter(r => r.exists && !r.compatible).forEach(r => console.log(`   - ${r.name}`));
	}

	if (summary.missing === 0 && summary.incompatible === 0) {
		console.log('\n🎉 All MCP types are present and compatible!');
		return true;
	} else {
		console.log('\n⚠️  Some issues found. Run the update script to fix them.');
		return false;
	}
}
