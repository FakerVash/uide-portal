
const http = require('http');

// 1. LOGIN AS ADMIN
const loginData = JSON.stringify({
    email: 'admin@uide.edu.ec',
    contrasena: 'admin123'
});

const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

console.log('--- ATTEMPTING LOGIN ---');

const reqLogin = http.request(loginOptions, (res) => {
    let data = '';

    console.log(`Login Status Code: ${res.statusCode}`);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            const response = JSON.parse(data);
            const token = response.token;
            console.log('Login Successful. Token received.');

            // 2. ATTEMPT DELETE SERVICE (Picking a random ID that likely exists or doesn't, just to test auth/headers)
            deleteService(token, 99999);
        } else {
            console.log('Login Failed:', data);
        }
    });
});

reqLogin.on('error', (error) => {
    console.error('Login Error:', error);
});

reqLogin.write(loginData);
reqLogin.end();

function deleteService(token, id) {
    console.log(`\n--- ATTEMPTING DELETE SERVICE (ID: ${id}) ---`);

    const deleteOptions = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/servicios/${id}`,
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const reqDelete = http.request(deleteOptions, (res) => {
        let data = '';

        console.log(`Delete Status Code: ${res.statusCode}`);
        console.log('Delete Headers:', JSON.stringify(res.headers, null, 2));

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('Delete Response Body:', data);
        });
    });

    reqDelete.on('error', (error) => {
        console.error('Delete Connection Error:', error);
    });

    reqDelete.end();
}
