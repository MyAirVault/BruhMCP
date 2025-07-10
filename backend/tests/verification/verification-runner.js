#!/usr/bin/env node

/**
 * Comprehensive Verification Agent Runner
 * 
 * Main script that orchestrates all verification tests:
 * - Port Management Verification
 * - Cleanup Verification  
 * - Duplicate Service Verification
 * - Generates comprehensive reports
 * - Provides exit codes for CI/CD integration
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import PortManagementTests from './port-management.test.js';
import CleanupTests from './cleanup.test.js';
import DuplicateServiceTests from './duplicate-services.test.js';
import TestUtils, { TestResultFormatter } from './test-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main verification runner class
 */
class VerificationRunner {
	constructor() {
		this.testSuites = [];
		this.results = {
			overall: {
				startTime: null,
				endTime: null,
				duration: 0,
				totalTests: 0,
				totalPassed: 0,
				totalFailed: 0,
				successRate: 0,
			},
			suites: [],
		};
		this.testUtils = new TestUtils();
	}

	/**
	 * Initialize the verification runner
	 */
	async initialize() {
		console.log('🚀 Initializing Comprehensive Verification Agent...\n');
		
		// Initialize test utilities
		await this.testUtils.initialize();
		
		// Register test suites
		this.registerTestSuites();
		
		console.log(`📝 Registered ${this.testSuites.length} test suites`);
		console.log('=' + '='.repeat(60) + '\n');
	}

	/**
	 * Register all test suites
	 */
	registerTestSuites() {
		this.testSuites = [
			{
				name: 'Port Management',
				description: 'Verify port allocation, release, and database synchronization',
				testClass: PortManagementTests,
				priority: 'high',
			},
			{
				name: 'Cleanup Operations', 
				description: 'Verify process termination and resource cleanup',
				testClass: CleanupTests,
				priority: 'high',
			},
			{
				name: 'Duplicate Services',
				description: 'Verify multiple instances of same MCP type support',
				testClass: DuplicateServiceTests,
				priority: 'high',
			},
		];
	}

	/**
	 * Run all verification tests
	 */
	async runAllTests() {
		this.results.overall.startTime = new Date();
		
		console.log('🔍 Starting Comprehensive Verification Tests...\n');
		
		for (const suiteConfig of this.testSuites) {
			await this.runTestSuite(suiteConfig);
		}
		
		this.results.overall.endTime = new Date();
		this.results.overall.duration = this.results.overall.endTime - this.results.overall.startTime;
		
		// Calculate overall statistics
		this.calculateOverallStats();
		
		// Generate reports
		await this.generateReports();
		
		// Print final summary
		this.printFinalSummary();
		
		return this.results;
	}

	/**
	 * Run a single test suite
	 */
	async runTestSuite(suiteConfig) {
		console.log(`\n🧪 Running ${suiteConfig.name} Tests`);
		console.log(`📋 ${suiteConfig.description}`);
		console.log('-'.repeat(50));
		
		const suiteStartTime = new Date();
		let suiteResult;
		
		try {
			const testInstance = new suiteConfig.testClass();
			const result = await testInstance.runAllTests();
			
			// Cleanup after tests
			if (typeof testInstance.cleanup === 'function') {
				await testInstance.cleanup();
			}
			
			suiteResult = {
				name: suiteConfig.name,
				description: suiteConfig.description,
				priority: suiteConfig.priority,
				success: true,
				startTime: suiteStartTime,
				endTime: new Date(),
				duration: new Date() - suiteStartTime,
				summary: result.summary,
				results: result.results,
				error: null,
			};
			
		} catch (error) {
			console.error(`❌ Test suite ${suiteConfig.name} failed:`, error.message);
			
			suiteResult = {
				name: suiteConfig.name,
				description: suiteConfig.description,
				priority: suiteConfig.priority,
				success: false,
				startTime: suiteStartTime,
				endTime: new Date(),
				duration: new Date() - suiteStartTime,
				summary: { total: 0, passed: 0, failed: 1, successRate: '0.0' },
				results: [],
				error: error.message,
			};
		}
		
		this.results.suites.push(suiteResult);
		
		console.log(`\n⏱️  Suite completed in ${suiteResult.duration}ms`);
		console.log('=' + '='.repeat(60));
	}

	/**
	 * Calculate overall statistics
	 */
	calculateOverallStats() {
		this.results.overall.totalTests = this.results.suites.reduce(
			(sum, suite) => sum + (suite.summary?.total || 0), 0
		);
		
		this.results.overall.totalPassed = this.results.suites.reduce(
			(sum, suite) => sum + (suite.summary?.passed || 0), 0
		);
		
		this.results.overall.totalFailed = this.results.suites.reduce(
			(sum, suite) => sum + (suite.summary?.failed || 0), 0
		);
		
		this.results.overall.successRate = this.results.overall.totalTests > 0
			? ((this.results.overall.totalPassed / this.results.overall.totalTests) * 100).toFixed(1)
			: '0.0';
	}

	/**
	 * Generate comprehensive reports
	 */
	async generateReports() {
		console.log('\n📊 Generating verification reports...');
		
		const reportsDir = join(__dirname, '..', '..', 'reports', 'verification');
		
		try {
			// Ensure reports directory exists
			mkdirSync(reportsDir, { recursive: true });
			
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			
			// Generate JSON report
			await this.generateJSONReport(reportsDir, timestamp);
			
			// Generate HTML report
			await this.generateHTMLReport(reportsDir, timestamp);
			
			// Generate console report (also save to file)
			await this.generateConsoleReport(reportsDir, timestamp);
			
			// Generate summary report
			await this.generateSummaryReport(reportsDir, timestamp);
			
			console.log(`✅ Reports generated in: ${reportsDir}`);
			
		} catch (error) {
			console.error('❌ Failed to generate reports:', error.message);
		}
	}

	/**
	 * Generate JSON report
	 */
	async generateJSONReport(reportsDir, timestamp) {
		const jsonReport = {
			metadata: {
				generatedAt: new Date().toISOString(),
				duration: this.results.overall.duration,
				environment: {
					nodeVersion: process.version,
					platform: process.platform,
					arch: process.arch,
				},
			},
			summary: this.results.overall,
			suites: this.results.suites,
		};
		
		const jsonPath = join(reportsDir, `verification-report-${timestamp}.json`);
		writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
		
		console.log(`📄 JSON report: ${jsonPath}`);
	}

	/**
	 * Generate HTML report
	 */
	async generateHTMLReport(reportsDir, timestamp) {
		const htmlContent = this.generateHTMLContent();
		const htmlPath = join(reportsDir, `verification-report-${timestamp}.html`);
		writeFileSync(htmlPath, htmlContent);
		
		console.log(`🌐 HTML report: ${htmlPath}`);
	}

	/**
	 * Generate HTML content
	 */
	generateHTMLContent() {
		const allResults = this.results.suites.flatMap(suite => 
			suite.results.map(result => ({
				...result,
				suiteName: suite.name,
				suitePriority: suite.priority,
			}))
		);
		
		let html = `
<!DOCTYPE html>
<html>
<head>
    <title>MCP Backend Verification Report</title>
    <meta charset="utf-8">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 20px; background: #f8f9fa; 
        }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2c3e50; margin: 0; }
        .header .subtitle { color: #7f8c8d; margin: 10px 0; }
        .summary { 
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; margin-bottom: 30px; 
        }
        .summary-card { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; padding: 20px; border-radius: 8px; text-align: center; 
        }
        .summary-card.success { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); }
        .summary-card.warning { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); }
        .summary-card.error { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); }
        .summary-card h3 { margin: 0 0 10px 0; font-size: 2em; }
        .summary-card p { margin: 0; opacity: 0.9; }
        .suite { margin-bottom: 30px; }
        .suite-header { 
            background: #e9ecef; padding: 15px; border-radius: 8px 8px 0 0; 
            border-left: 4px solid #007bff; 
        }
        .suite-header h2 { margin: 0; color: #2c3e50; }
        .suite-header .suite-info { color: #6c757d; margin: 5px 0 0 0; }
        .test-results { border: 1px solid #dee2e6; border-top: none; border-radius: 0 0 8px 8px; }
        .test-result { 
            padding: 15px; border-bottom: 1px solid #dee2e6; 
            display: flex; align-items: flex-start; gap: 15px; 
        }
        .test-result:last-child { border-bottom: none; }
        .test-result.success { background: #f8fff9; border-left: 4px solid #28a745; }
        .test-result.failure { background: #fff8f8; border-left: 4px solid #dc3545; }
        .test-status { font-size: 1.5em; flex-shrink: 0; }
        .test-content { flex: 1; }
        .test-name { font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
        .test-message { color: #6c757d; margin-bottom: 10px; }
        .test-error { color: #dc3545; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; }
        .test-details { 
            background: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 10px;
            max-height: 300px; overflow-y: auto; 
        }
        .test-details pre { margin: 0; white-space: pre-wrap; font-size: 12px; }
        .footer { text-align: center; margin-top: 30px; color: #6c757d; border-top: 1px solid #dee2e6; padding-top: 20px; }
        .collapsible { cursor: pointer; user-select: none; }
        .collapsible:hover { background: #f8f9fa; }
        .collapsible-content { display: none; }
        .collapsible.active .collapsible-content { display: block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 MCP Backend Verification Report</h1>
            <p class="subtitle">Comprehensive verification of port management, cleanup, and duplicate service fixes</p>
            <p class="subtitle">Generated: ${new Date().toISOString()}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>${this.results.overall.totalTests}</h3>
                <p>Total Tests</p>
            </div>
            <div class="summary-card success">
                <h3>${this.results.overall.totalPassed}</h3>
                <p>Passed</p>
            </div>
            <div class="summary-card ${this.results.overall.totalFailed > 0 ? 'error' : 'success'}">
                <h3>${this.results.overall.totalFailed}</h3>
                <p>Failed</p>
            </div>
            <div class="summary-card ${parseFloat(this.results.overall.successRate) >= 90 ? 'success' : parseFloat(this.results.overall.successRate) >= 70 ? 'warning' : 'error'}">
                <h3>${this.results.overall.successRate}%</h3>
                <p>Success Rate</p>
            </div>
        </div>
		`;
		
		// Add test suites
		this.results.suites.forEach(suite => {
			const suiteSuccess = suite.success && (suite.summary?.failed || 0) === 0;
			const suiteStatusIcon = suiteSuccess ? '✅' : '❌';
			
			html += `
        <div class="suite">
            <div class="suite-header">
                <h2>${suiteStatusIcon} ${suite.name}</h2>
                <p class="suite-info">${suite.description}</p>
                <p class="suite-info">
                    Duration: ${suite.duration}ms | 
                    Tests: ${suite.summary?.total || 0} | 
                    Passed: ${suite.summary?.passed || 0} | 
                    Failed: ${suite.summary?.failed || 0} |
                    Success Rate: ${suite.summary?.successRate || '0.0'}%
                </p>
            </div>
            <div class="test-results">
			`;
			
			if (suite.error) {
				html += `
                <div class="test-result failure">
                    <div class="test-status">❌</div>
                    <div class="test-content">
                        <div class="test-name">Suite Execution Error</div>
                        <div class="test-error">${suite.error}</div>
                    </div>
                </div>
				`;
			} else {
				suite.results.forEach(result => {
					const resultClass = result.success ? 'success' : 'failure';
					const resultIcon = result.success ? '✅' : '❌';
					
					html += `
                <div class="test-result ${resultClass} collapsible" onclick="toggleDetails(this)">
                    <div class="test-status">${resultIcon}</div>
                    <div class="test-content">
                        <div class="test-name">${result.test}</div>
                        <div class="test-message">${result.message}</div>
					`;
					
					if (result.error) {
						html += `<div class="test-error">Error: ${result.error}</div>`;
					}
					
					if (result.details && Object.keys(result.details).length > 0) {
						html += `
                        <div class="collapsible-content">
                            <div class="test-details">
                                <pre>${JSON.stringify(result.details, null, 2)}</pre>
                            </div>
                        </div>
						`;
					}
					
					html += `
                    </div>
                </div>
					`;
				});
			}
			
			html += `
            </div>
        </div>
			`;
		});
		
		html += `
        <div class="footer">
            <p>Report generated by MCP Backend Verification Agent</p>
            <p>For technical details, see the JSON report or console output</p>
        </div>
    </div>

    <script>
        function toggleDetails(element) {
            element.classList.toggle('active');
        }
    </script>
</body>
</html>
		`;
		
		return html;
	}

	/**
	 * Generate console report
	 */
	async generateConsoleReport(reportsDir, timestamp) {
		const consolePath = join(reportsDir, `verification-console-${timestamp}.txt`);
		
		let consoleOutput = '';
		consoleOutput += '🔍 MCP Backend Verification Report\n';
		consoleOutput += '=' + '='.repeat(60) + '\n\n';
		consoleOutput += `Generated: ${new Date().toISOString()}\n`;
		consoleOutput += `Duration: ${this.results.overall.duration}ms\n\n`;
		
		consoleOutput += '📊 Overall Summary:\n';
		consoleOutput += `   Total Tests: ${this.results.overall.totalTests}\n`;
		consoleOutput += `   Passed: ${this.results.overall.totalPassed}\n`;
		consoleOutput += `   Failed: ${this.results.overall.totalFailed}\n`;
		consoleOutput += `   Success Rate: ${this.results.overall.successRate}%\n\n`;
		
		this.results.suites.forEach(suite => {
			consoleOutput += `\n🧪 ${suite.name} (${suite.duration}ms)\n`;
			consoleOutput += '-'.repeat(50) + '\n';
			consoleOutput += `Description: ${suite.description}\n`;
			consoleOutput += `Priority: ${suite.priority}\n`;
			
			if (suite.error) {
				consoleOutput += `❌ Suite Error: ${suite.error}\n`;
			} else {
				consoleOutput += `Summary: ${suite.summary.passed}/${suite.summary.total} passed (${suite.summary.successRate}%)\n\n`;
				
				suite.results.forEach(result => {
					const status = result.success ? '✅' : '❌';
					consoleOutput += `${status} ${result.test}\n`;
					consoleOutput += `   ${result.message}\n`;
					
					if (result.error) {
						consoleOutput += `   Error: ${result.error}\n`;
					}
					
					consoleOutput += '\n';
				});
			}
		});
		
		writeFileSync(consolePath, consoleOutput);
		console.log(`📄 Console report: ${consolePath}`);
	}

	/**
	 * Generate summary report
	 */
	async generateSummaryReport(reportsDir, timestamp) {
		const summaryPath = join(reportsDir, `verification-summary-${timestamp}.json`);
		
		const summary = {
			timestamp: new Date().toISOString(),
			overall: this.results.overall,
			suites: this.results.suites.map(suite => ({
				name: suite.name,
				priority: suite.priority,
				success: suite.success,
				duration: suite.duration,
				summary: suite.summary,
				error: suite.error,
			})),
			recommendations: this.generateRecommendations(),
		};
		
		writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
		console.log(`📋 Summary report: ${summaryPath}`);
	}

	/**
	 * Generate recommendations based on test results
	 */
	generateRecommendations() {
		const recommendations = [];
		
		const failedTests = this.results.suites.flatMap(suite => 
			suite.results.filter(result => !result.success)
		);
		
		if (failedTests.length === 0) {
			recommendations.push({
				type: 'success',
				message: 'All verification tests passed! The system is working correctly.',
				priority: 'info',
			});
		} else {
			// Group failed tests by type
			const portFailures = failedTests.filter(t => t.test.toLowerCase().includes('port'));
			const cleanupFailures = failedTests.filter(t => t.test.toLowerCase().includes('cleanup'));
			const duplicateFailures = failedTests.filter(t => t.test.toLowerCase().includes('duplicate') || t.test.toLowerCase().includes('instance'));
			
			if (portFailures.length > 0) {
				recommendations.push({
					type: 'port_management',
					message: 'Port management issues detected. Check port allocation logic and database synchronization.',
					priority: 'high',
					failedTests: portFailures.map(t => t.test),
				});
			}
			
			if (cleanupFailures.length > 0) {
				recommendations.push({
					type: 'cleanup',
					message: 'Cleanup process issues detected. Review process termination and resource cleanup logic.',
					priority: 'high',
					failedTests: cleanupFailures.map(t => t.test),
				});
			}
			
			if (duplicateFailures.length > 0) {
				recommendations.push({
					type: 'duplicate_services',
					message: 'Duplicate service support issues detected. Check database constraints and instance management.',
					priority: 'medium',
					failedTests: duplicateFailures.map(t => t.test),
				});
			}
		}
		
		// Performance recommendations
		const avgDuration = this.results.suites.reduce((sum, suite) => sum + suite.duration, 0) / this.results.suites.length;
		if (avgDuration > 10000) { // More than 10 seconds average
			recommendations.push({
				type: 'performance',
				message: 'Test suite execution is slow. Consider optimizing database operations and test setup.',
				priority: 'low',
			});
		}
		
		return recommendations;
	}

	/**
	 * Print final summary to console
	 */
	printFinalSummary() {
		console.log('\n' + '='.repeat(80));
		console.log('🎯 FINAL VERIFICATION SUMMARY');
		console.log('='.repeat(80));
		
		console.log(`\n📊 Overall Results:`);
		console.log(`   Total Duration: ${this.results.overall.duration}ms`);
		console.log(`   Total Tests: ${this.results.overall.totalTests}`);
		console.log(`   Passed: ${this.results.overall.totalPassed} ✅`);
		console.log(`   Failed: ${this.results.overall.totalFailed} ❌`);
		console.log(`   Success Rate: ${this.results.overall.successRate}%`);
		
		console.log('\n🧪 Suite Results:');
		this.results.suites.forEach(suite => {
			const status = suite.success && (suite.summary?.failed || 0) === 0 ? '✅' : '❌';
			console.log(`   ${status} ${suite.name}: ${suite.summary?.passed || 0}/${suite.summary?.total || 0} (${suite.summary?.successRate || '0.0'}%)`);
		});
		
		// Print recommendations
		const recommendations = this.generateRecommendations();
		if (recommendations.length > 0) {
			console.log('\n💡 Recommendations:');
			recommendations.forEach(rec => {
				const icon = rec.priority === 'high' ? '🔥' : rec.priority === 'medium' ? '⚠️' : 'ℹ️';
				console.log(`   ${icon} [${rec.priority.toUpperCase()}] ${rec.message}`);
			});
		}
		
		const overallSuccess = this.results.overall.totalFailed === 0;
		console.log(`\n🎯 Overall Status: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
		
		if (!overallSuccess) {
			console.log('\n❌ Some tests failed. Please review the reports and address the issues.');
		} else {
			console.log('\n✅ All verifications passed! The system is working correctly.');
		}
		
		console.log('\n' + '='.repeat(80));
	}

	/**
	 * Cleanup test environment
	 */
	async cleanup() {
		console.log('\n🧹 Cleaning up verification environment...');
		
		try {
			await this.testUtils.cleanup();
			console.log('✅ Verification environment cleaned up');
		} catch (error) {
			console.error('❌ Error during cleanup:', error.message);
		}
	}

	/**
	 * Get exit code based on results
	 */
	getExitCode() {
		return this.results.overall.totalFailed === 0 ? 0 : 1;
	}
}

/**
 * Main execution function
 */
async function main() {
	const runner = new VerificationRunner();
	
	try {
		await runner.initialize();
		await runner.runAllTests();
		
		const exitCode = runner.getExitCode();
		process.exit(exitCode);
		
	} catch (error) {
		console.error('\n💥 Verification runner crashed:', error);
		console.error(error.stack);
		process.exit(1);
		
	} finally {
		try {
			await runner.cleanup();
		} catch (cleanupError) {
			console.error('❌ Cleanup error:', cleanupError.message);
		}
	}
}

// Handle process signals for graceful shutdown
process.on('SIGINT', async () => {
	console.log('\n⚠️  Received SIGINT, shutting down gracefully...');
	process.exit(1);
});

process.on('SIGTERM', async () => {
	console.log('\n⚠️  Received SIGTERM, shutting down gracefully...');
	process.exit(1);
});

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(error => {
		console.error('💥 Unhandled error:', error);
		process.exit(1);
	});
}

export default VerificationRunner;