// Test script to verify /api/usuarios/me endpoint
import fetch from 'node-fetch';

async function testGetMe() {
    try {
        // You'll need to replace this with a valid token from your browser
        const token = 'YOUR_TOKEN_HERE';

        const response = await fetch('http://localhost:8000/api/usuarios/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Response from /api/usuarios/me:');
            console.log(JSON.stringify(data, null, 2));
            console.log('\n--- Checking habilidades field ---');
            console.log('habilidades:', data.habilidades);
        } else {
            console.error('Error:', response.status, await response.text());
        }
    } catch (error) {
        console.error('Failed to fetch:', error);
    }
}

testGetMe();
