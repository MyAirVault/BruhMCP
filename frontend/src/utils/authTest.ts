// Authentication Integration Test Utility
// This file provides testing functions to verify auth integration

// Auth service integration removed - now handled by AuthContext
// import { 
//   requestMagicLink, 
//   verifyToken, 
//   getCurrentUser, 
//   checkAuthStatus, 
//   logout 
// } from '../services/authService';

export interface AuthTestResult {
  step: string;
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

// Auth test class commented out - now handled by AuthContext
/*
export class AuthIntegrationTest {
  private results: AuthTestResult[] = [];

  async runFullAuthTest(testEmail: string): Promise<AuthTestResult[]> {
    console.log('🧪 Starting Authentication Integration Test');
    
    // Step 1: Test magic link request
    await this.testMagicLinkRequest(testEmail);
    
    // Step 2: Test auth status check (should be false initially)
    await this.testAuthStatusCheck(false);
    
    // Step 3: Test get current user (should fail)
    await this.testGetCurrentUser(false);
    
    // Step 4: Test logout (should work even if not authenticated)
    await this.testLogout();
    
    return this.results;
  }

  private async testMagicLinkRequest(email: string): Promise<void> {
    try {
      console.log(`📧 Testing magic link request for: ${email}`);
      const response = await requestMagicLink(email);
      
      this.results.push({
        step: 'Magic Link Request',
        success: true,
        data: {
          email: response.email,
          hasToken: !!response.token,
          message: response.message
        }
      });
      
      console.log('✅ Magic link request successful');
      if (response.token) {
        console.log(`🔗 Token received: ${response.token}`);
      }
    } catch (error) {
      this.results.push({
        step: 'Magic Link Request',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log('❌ Magic link request failed:', error);
    }
  }

  private async testAuthStatusCheck(expectedAuthenticated: boolean): Promise<void> {
    try {
      console.log(`🔍 Testing auth status check (expecting ${expectedAuthenticated ? 'authenticated' : 'not authenticated'})`);
      const isAuthenticated = await checkAuthStatus();
      
      const success = isAuthenticated === expectedAuthenticated;
      this.results.push({
        step: 'Auth Status Check',
        success,
        data: {
          isAuthenticated,
          expected: expectedAuthenticated
        }
      });
      
      if (success) {
        console.log('✅ Auth status check matches expectation');
      } else {
        console.log('❌ Auth status check does not match expectation');
      }
    } catch (error) {
      this.results.push({
        step: 'Auth Status Check',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log('❌ Auth status check failed:', error);
    }
  }

  private async testGetCurrentUser(expectSuccess: boolean): Promise<void> {
    try {
      console.log(`👤 Testing get current user (expecting ${expectSuccess ? 'success' : 'failure'})`);
      const response = await getCurrentUser();
      
      const success = expectSuccess;
      this.results.push({
        step: 'Get Current User',
        success,
        data: {
          user: response.user,
          success: response.success
        }
      });
      
      if (success) {
        console.log('✅ Get current user successful');
        console.log('User:', response.user);
      } else {
        console.log('❌ Get current user failed as expected');
      }
    } catch (error) {
      const success = !expectSuccess;
      this.results.push({
        step: 'Get Current User',
        success,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      if (success) {
        console.log('✅ Get current user failed as expected');
      } else {
        console.log('❌ Get current user failed unexpectedly:', error);
      }
    }
  }

  private async testLogout(): Promise<void> {
    try {
      console.log('🚪 Testing logout');
      await logout();
      
      this.results.push({
        step: 'Logout',
        success: true
      });
      
      console.log('✅ Logout successful');
    } catch (error) {
      this.results.push({
        step: 'Logout',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log('❌ Logout failed:', error);
    }
  }

  async testTokenVerification(token: string): Promise<void> {
    try {
      console.log(`🔐 Testing token verification: ${token}`);
      const response = await verifyToken(token);
      
      this.results.push({
        step: 'Token Verification',
        success: true,
        data: {
          user: response.user,
          success: response.success
        }
      });
      
      console.log('✅ Token verification successful');
      console.log('User:', response.user);
    } catch (error) {
      this.results.push({
        step: 'Token Verification',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log('❌ Token verification failed:', error);
    }
  }

  printResults(): void {
    console.log('\n📊 Authentication Integration Test Results');
    console.log('==========================================');
    
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.step}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.data) {
        console.log(`   Data:`, result.data);
      }
    });
    
    const successCount = this.results.filter(r => r.success).length;
    const totalCount = this.results.length;
    
    console.log(`\n🎯 Summary: ${successCount}/${totalCount} tests passed`);
    
    if (successCount === totalCount) {
      console.log('🎉 All tests passed! Authentication integration is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the results above.');
    }
  }
}

// Quick test function for development
export const quickAuthTest = async (email: string = 'test@example.com') => {
  const tester = new AuthIntegrationTest();
  await tester.runFullAuthTest(email);
  tester.printResults();
  return tester;
};
*/