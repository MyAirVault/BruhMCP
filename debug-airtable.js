// Quick debug script to test the Airtable API directly
import fetch from 'node-fetch';

const apiKey = 'patGW0IbJGbSRvfsf.700da7fa2dec0569d71870ec5e07f7ba15fc47d420542966a35854ce3cfab2ff';

async function testListBases() {
  console.log('Testing Airtable list bases...\n');
  
  try {
    const response = await fetch('https://api.airtable.com/v0/meta/bases', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\nResponse data:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('Error response:', text);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testListBases();