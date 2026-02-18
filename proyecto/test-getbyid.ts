import fetch from 'node-fetch';

async function testGetById() {
    try {
        const response = await fetch('http://localhost:8000/api/usuarios/2');

        if (response.ok) {
            const data = await response.json();
            console.log('=== RESPONSE FROM /api/usuarios/2 ===');
            console.log('habilidades field:', data.habilidades);
            console.log('\nFull response:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error('Error:', response.status);
        }
    } catch (error) {
        console.error('Failed:', error);
    }
}

testGetById();
