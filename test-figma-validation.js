// Test script to verify Figma validation behavior
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api/v1';

// Test invalid Figma API key
async function testFigmaValidation() {
  console.log('Testing Figma validation with invalid API key...\n');
  
  const invalidApiKey = 'figd_invalid_test_key_12345678901234567890';
  
  try {
    const response = await fetch(`${API_BASE}/auth-registry/validate/figma`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth cookie if needed
      },
      body: JSON.stringify({
        apiKey: invalidApiKey
      })
    });
    
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(result, null, 2));
    
    if (result.success === false) {
      console.log('\n✓ Validation correctly failed for invalid API key');
      console.log('Message:', result.message);
    } else {
      console.log('\n✗ Validation unexpectedly succeeded');
    }
    
  } catch (error) {
    console.error('Error during validation:', error);
  }
}

// Run the test
testFigmaValidation();