# MCP Backend Verification Agent

A comprehensive verification system that validates the port management, cleanup, and duplicate service fixes implemented in the MCP backend.

## Overview

This verification agent tests the following critical systems:

### 🔌 Port Management Verification
- Port allocation and release mechanisms
- Database synchronization with port manager
- Port conflict prevention
- Port range validation
- Port cleanup on process termination

### 🧹 Cleanup Verification
- Process termination releases ports properly
- Database cleanup on instance deletion
- Graceful vs forced termination handling
- Port leak detection and prevention
- Process manager cleanup integration

### 🔄 Duplicate Service Verification
- Multiple instances of same MCP type support
- Unique port and credential allocation
- Independent instance operation
- Database constraint enforcement
- Concurrent instance management

## Quick Start

### Run All Verification Tests
```bash
# From the backend directory
npm run verify

# Or run directly
node tests/verification/verification-runner.js
```

### Run Individual Test Suites
```bash
# Port management tests only
node -e "import('./tests/verification/port-management.test.js').then(m => new m.default().runAllTests())"

# Cleanup tests only
node -e "import('./tests/verification/cleanup.test.js').then(m => new m.default().runAllTests())"

# Duplicate service tests only
node -e "import('./tests/verification/duplicate-services.test.js').then(m => new m.default().runAllTests())"
```

## Test Files

### Core Test Suites
- **`port-management.test.js`** - Comprehensive port management verification
- **`cleanup.test.js`** - Process and resource cleanup verification
- **`duplicate-services.test.js`** - Multiple instance support verification

### Support Files
- **`verification-runner.js`** - Main orchestration script
- **`test-utils.js`** - Common utilities and helpers
- **`README.md`** - This documentation

## Output and Reports

The verification agent generates multiple types of reports:

### Console Output
Real-time test execution with immediate feedback:
```
🔍 Starting Port Management Tests...
✅ Database Synchronization: Port manager successfully synchronized
✅ Port Allocation/Release: Working correctly
❌ Port Conflict Prevention: Issues detected
...
```

### Generated Reports
Reports are saved to `backend/reports/verification/`:

1. **JSON Report** (`verification-report-{timestamp}.json`)
   - Complete test results in structured format
   - Suitable for automated processing
   - Contains detailed test metadata

2. **HTML Report** (`verification-report-{timestamp}.html`)
   - Interactive web-based report
   - Collapsible test details
   - Visual success/failure indicators
   - Summary dashboard

3. **Console Report** (`verification-console-{timestamp}.txt`)
   - Plain text version of console output
   - Suitable for CI/CD logs
   - Easy to search and parse

4. **Summary Report** (`verification-summary-{timestamp}.json`)
   - High-level results summary
   - Recommendations for fixes
   - Performance metrics

## Exit Codes

The verification agent returns appropriate exit codes for CI/CD integration:

- **0**: All tests passed
- **1**: One or more tests failed or system error

## Test Configuration

### Environment Variables
The tests respect these environment variables:

```bash
# Port range configuration (from main app)
PORT_RANGE_START=49160   # Default: 49160
PORT_RANGE_END=49999     # Default: 49999

# Database connection (from main app)
DATABASE_URL=postgresql://... # Required

# Test environment
NODE_ENV=test            # Recommended for testing
```

### Prerequisites
Before running tests, ensure:

1. **Database is accessible** - Tests need database connectivity
2. **Port manager is initialized** - Will auto-initialize if needed
3. **No conflicting processes** - Tests allocate real ports
4. **Sufficient permissions** - Tests create/delete database records

## Understanding Test Results

### Success Indicators
- ✅ **Green checkmarks** - Test passed
- **High success rate** (>90%) - System is healthy
- **Fast execution** (<10s per suite) - Good performance

### Failure Indicators
- ❌ **Red X marks** - Test failed
- **Error messages** - Specific failure details
- **Low success rate** (<70%) - System needs attention

### Common Test Failures

#### Port Management Issues
```
❌ Database Synchronization: Sync mismatch - Missing: [3005], Extra: []
```
**Fix**: Check port manager database sync logic

#### Cleanup Issues
```
❌ Process Termination Cleanup: Port not released after process exit
```
**Fix**: Review process monitoring and cleanup handlers

#### Duplicate Service Issues
```
❌ Database Constraints: Unique constraint not enforced
```
**Fix**: Verify database schema and constraint definitions

## Test Details

### Port Management Tests

1. **Database Sync Test**
   - Verifies port manager syncs with database on startup
   - Compares in-memory ports with database records
   - Ensures no missing or extra ports

2. **Allocation/Release Test**
   - Tests port allocation and release cycles
   - Verifies unique port assignment
   - Checks proper state management

3. **Conflict Prevention Test**
   - Tests duplicate port reservation prevention
   - Verifies availability checking
   - Ensures proper conflict handling

4. **Range Validation Test**
   - Validates port range boundaries
   - Tests exhaustion scenarios
   - Verifies range consistency

5. **Cleanup Simulation Test**
   - Simulates process termination scenarios
   - Verifies port cleanup behavior
   - Tests state restoration

### Cleanup Tests

1. **Process Termination Test**
   - Creates test processes using ports
   - Terminates processes gracefully/forcefully
   - Verifies port cleanup after termination

2. **Database Cleanup Test**
   - Creates test database records
   - Deletes instances and verifies cleanup
   - Checks orphaned port tracking

3. **Graceful vs Forced Test**
   - Tests different termination methods
   - Measures termination timing
   - Verifies cleanup consistency

4. **Port Leak Detection Test**
   - Performs multiple allocation/release cycles
   - Monitors for unreleased ports
   - Detects memory/state leaks

5. **Process Manager Integration Test**
   - Tests process manager cleanup logic
   - Verifies error handling
   - Checks integration points

### Duplicate Service Tests

1. **Multiple Instance Creation Test**
   - Creates multiple instances of same MCP type
   - Verifies unique properties (ports, tokens, numbers)
   - Tests sequential numbering

2. **Database Constraints Test**
   - Tests unique constraint enforcement
   - Verifies port/token uniqueness
   - Checks constraint violation handling

3. **Instance Independence Test**
   - Modifies one instance
   - Verifies other instances unaffected
   - Tests isolation between instances

4. **Counting and Limits Test**
   - Tests instance number calculation
   - Verifies limit enforcement (max 10)
   - Checks counting accuracy

5. **Concurrent Management Test**
   - Tests concurrent instance creation/deletion
   - Verifies thread safety
   - Checks race condition handling

## Troubleshooting

### Common Issues

#### Database Connection Errors
```
Error: Failed to initialize port manager: connection refused
```
**Solution**: Ensure PostgreSQL is running and accessible

#### Port Conflicts
```
Error: Port 49160 already in use
```
**Solution**: Stop conflicting services or change port range

#### Permission Errors
```
Error: Cannot create test user: permission denied
```
**Solution**: Ensure database user has sufficient privileges

#### Test Timeouts
```
Error: Test timed out after 30 seconds
```
**Solution**: Check for hanging processes or database locks

### Debug Mode

For detailed debugging, run with additional logging:
```bash
DEBUG=verification:* node tests/verification/verification-runner.js
```

### Manual Verification

You can manually verify specific components:

```javascript
// Test port manager directly
import portManager from '../../src/services/portManager.js';
await portManager.initialize();
const port = await portManager.getAvailablePort();
console.log('Got port:', port);
portManager.releasePort(port);
```

## Contributing

### Adding New Tests

1. Create test class extending appropriate pattern
2. Implement test methods with descriptive names
3. Add proper cleanup and error handling
4. Update verification runner to include new tests

### Test Structure

```javascript
export class MyNewTests {
  constructor() {
    this.testResults = [];
  }

  async testSomething() {
    try {
      // Test logic here
      const success = /* test condition */;
      
      this.testResults.push({
        test: 'Test Name',
        success,
        details: { /* test details */ },
        message: success ? 'Success message' : 'Failure message'
      });
      
      return success;
    } catch (error) {
      this.testResults.push({
        test: 'Test Name',
        success: false,
        error: error.message,
        message: 'Test failed with error'
      });
      return false;
    }
  }

  async runAllTests() {
    // Run all test methods
    // Return summary and results
  }

  async cleanup() {
    // Clean up test resources
  }
}
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: MCP Backend Verification
on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run db:migrate
      - run: npm run verify
      
      - name: Upload verification reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: verification-reports
          path: reports/verification/
```

### Exit Code Handling

```bash
#!/bin/bash
npm run verify
if [ $? -eq 0 ]; then
    echo "✅ All verifications passed"
else
    echo "❌ Verification failures detected"
    exit 1
fi
```

## Performance Benchmarks

Expected performance benchmarks for healthy systems:

- **Port Management Tests**: < 5 seconds
- **Cleanup Tests**: < 10 seconds (includes process creation)
- **Duplicate Service Tests**: < 8 seconds
- **Total Verification**: < 30 seconds

If tests consistently exceed these times, investigate:
- Database performance
- Port availability
- System resource constraints

## Security Considerations

The verification tests:
- Use isolated test data (UUIDs starting with `550e8400`)
- Clean up all created resources
- Don't expose sensitive information in logs
- Use safe port ranges for testing
- Validate all inputs and outputs

---

For more information or issues, please refer to the main project documentation or create an issue in the project repository.