import http from 'http';

const id = 1; // Assuming service ID 1 has reviews

const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/servicios/${id}`,
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            console.log('Status Code:', res.statusCode);
            if (res.statusCode === 200) {
                const parsed = JSON.parse(data);
                if (parsed.resenas) {
                    console.log('Reviews in API:', parsed.resenas.length);
                    if (parsed.resenas.length > 0) {
                        console.log('First review:', JSON.stringify(parsed.resenas[0], null, 2));
                    }
                } else {
                    console.log('No reviews field in API response.');
                    console.log('Keys:', Object.keys(parsed));
                }
            } else {
                console.log('Error status:', res.statusCode);
                console.log('Body:', data);
            }
        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw data:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.end();
