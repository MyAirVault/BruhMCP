#!/usr/bin/env node

/**
 * Verification Agent Validation Script
 * 
 * Quick validation that the verification agent can be imported and initialized
 * without running the full test suite. Useful for CI/CD pre-checks.
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function validateVerificationAgent() {
	console.log('🔍 Validating Verification Agent Components...\n');
	
	const validationResults = [];
	
	try {
		// Test 1: Import verification runner
		console.log('📦 Testing imports...');
		const { default: VerificationRunner } = await import('./verification-runner.js');
		validationResults.push({ test: 'Import VerificationRunner', success: true });
		
		// Test 2: Import test suites
		const { default: PortManagementTests } = await import('./port-management.test.js');
		validationResults.push({ test: 'Import PortManagementTests', success: true });
		
		const { default: CleanupTests } = await import('./cleanup.test.js');
		validationResults.push({ test: 'Import CleanupTests', success: true });
		
		const { default: DuplicateServiceTests } = await import('./duplicate-services.test.js');
		validationResults.push({ test: 'Import DuplicateServiceTests', success: true });
		
		// Test 3: Import utilities
		const { default: TestUtils } = await import('./test-utils.js');
		validationResults.push({ test: 'Import TestUtils', success: true });
		
		console.log('✅ All imports successful');
		
		// Test 4: Instantiate runner
		console.log('🔧 Testing instantiation...');
		const runner = new VerificationRunner();
		validationResults.push({ test: 'Instantiate VerificationRunner', success: true });
		
		// Test 5: Check test suite registration
		runner.registerTestSuites();
		const suiteCount = runner.testSuites.length;
		const expectedSuites = 3; // Port, Cleanup, Duplicate
		const suitesCorrect = suiteCount === expectedSuites;
		validationResults.push({ 
			test: 'Test Suite Registration', 
			success: suitesCorrect,
			details: { expected: expectedSuites, actual: suiteCount }
		});
		
		if (suitesCorrect) {
			console.log(`✅ ${suiteCount} test suites registered correctly`);
		} else {
			console.log(`❌ Expected ${expectedSuites} suites, got ${suiteCount}`);
		}
		
		// Test 6: Test utilities instantiation
		console.log('🛠️  Testing utilities...');
		const testUtils = new TestUtils();
		validationResults.push({ test: 'Instantiate TestUtils', success: true });
		
		// Test 7: Check test class instantiation
		const portTests = new PortManagementTests();
		const cleanupTests = new CleanupTests();
		const duplicateTests = new DuplicateServiceTests();
		
		validationResults.push({ test: 'Instantiate test classes', success: true });
		console.log('✅ All test classes instantiated successfully');
		
		// Test 8: Validate required methods exist
		const requiredMethods = ['runAllTests', 'cleanup'];
		const testClasses = [
			{ name: 'PortManagementTests', instance: portTests },
			{ name: 'CleanupTests', instance: cleanupTests },
			{ name: 'DuplicateServiceTests', instance: duplicateTests },
		];
		
		let allMethodsExist = true;
		for (const testClass of testClasses) {
			for (const method of requiredMethods) {
				if (typeof testClass.instance[method] !== 'function') {
					console.log(`❌ ${testClass.name}.${method} is not a function`);
					allMethodsExist = false;
				}
			}
		}
		
		if (allMethodsExist) {
			console.log('✅ All required methods exist');
		}
		
		validationResults.push({ test: 'Required methods exist', success: allMethodsExist });
		
	} catch (error) {
		console.error('❌ Validation failed:', error.message);
		validationResults.push({ 
			test: 'Overall validation', 
			success: false, 
			error: error.message 
		});
	}
	
	// Print validation summary
	console.log('\n📊 Validation Summary:');
	console.log('=' + '='.repeat(40));
	
	const passedTests = validationResults.filter(r => r.success).length;
	const totalTests = validationResults.length;
	const successRate = ((passedTests / totalTests) * 100).toFixed(1);
	
	validationResults.forEach(result => {
		const status = result.success ? '✅' : '❌';
		console.log(`${status} ${result.test}`);
		if (result.error) {
			console.log(`   Error: ${result.error}`);
		}
		if (result.details) {
			console.log(`   Details: ${JSON.stringify(result.details)}`);
		}
	});
	
	console.log('\n📈 Results:');
	console.log(`   Passed: ${passedTests}/${totalTests}`);
	console.log(`   Success Rate: ${successRate}%`);
	
	const overallSuccess = passedTests === totalTests;
	console.log(`\n🎯 Validation Status: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
	
	if (overallSuccess) {
		console.log('\n✅ Verification Agent is ready to run!');
		console.log('💡 Use "npm run verify" to run full verification tests');
	} else {
		console.log('\n❌ Verification Agent has issues that need to be resolved');
	}
	
	return overallSuccess ? 0 : 1;
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	validateVerificationAgent()
		.then(exitCode => process.exit(exitCode))
		.catch(error => {
			console.error('💥 Validation script crashed:', error);
			process.exit(1);
		});
}

export default validateVerificationAgent;