
// Removed node-fetch import to rely on native fetch in Node 18+

const API_URL = 'http://127.0.0.1:8000/api';
const REPORT_FILE = 'API_TEST_REPORT.md';
import fs from 'fs';

interface TestResult {
    endpoint: string;
    method: string;
    status: number;
    success: boolean;
    duration: number;
    data?: any;
    error?: any;
}

const results: TestResult[] = [];

async function logResult(endpoint: string, method: string, start: number, response: any, data: any = null, error: any = null) {
    const duration = Date.now() - start;
    const success = response.status >= 200 && response.status < 300;

    console.log(`[${method}] ${endpoint} - ${response.status} (${duration}ms) ${success ? '✅' : '❌'}`);

    results.push({
        endpoint,
        method,
        status: response.status,
        success,
        duration,
        data,
        error
    });
}

async function runTests() {
    console.log('🚀 Starting API Test Suite...');

    let token = '';
    let userId = 0;

    // 1. Test Health Check
    try {
        const start = Date.now();
        const res = await fetch('http://127.0.0.1:8000/health');
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }

        await logResult('/health', 'GET', start, res, data);
    } catch (e: any) {
        console.error('Health check failed:', e);
        results.push({ endpoint: '/health', method: 'GET', status: 0, success: false, duration: 0, error: e.message });
    }

    // 2. Login (Auth)
    try {
        console.log('\n🔑 Testing Authentication...');
        const start = Date.now();
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@uide.edu.ec',
                contrasena: 'admin123'
            })
        });
        const text = await res.text();
        let data: any;
        try { data = JSON.parse(text); } catch { data = { error: text }; }

        await logResult('/auth/login', 'POST', start, res, { ...data, token: '***' });

        if (data.token) {
            token = data.token;
            userId = data.usuario.id_usuario;
        }
    } catch (e: any) {
        console.error('Login failed:', e);
        results.push({ endpoint: '/auth/login', method: 'POST', status: 0, success: false, duration: 0, error: e.message });
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    if (!token) {
        console.error('❌ Skipping authenticated tests due to login failure.');
    } else {
        // 3. Get User Profile
        try {
            const start = Date.now();
            const res = await fetch(`${API_URL}/usuarios/me`, { headers });
            const data = await res.json();
            await logResult('/usuarios/me', 'GET', start, res, data);
        } catch (e: any) {
            console.error('Profile fetch failed:', e);
            results.push({ endpoint: '/usuarios/me', method: 'GET', status: 0, success: false, duration: 0, error: e.message });
        }

        // 4. Get Categories (Public)
        try {
            const start = Date.now();
            const res = await fetch(`${API_URL}/categorias`);
            const data = await res.json();
            await logResult('/categorias', 'GET', start, res, Array.isArray(data) ? `Count: ${data.length}` : data);
        } catch (e: any) {
            console.error('Categories fetch failed:', e);
            results.push({ endpoint: '/categorias', method: 'GET', status: 0, success: false, duration: 0, error: e.message });
        }

        // 5. Get Services
        try {
            const start = Date.now();
            const res = await fetch(`${API_URL}/servicios`);
            const data = await res.json();
            await logResult('/servicios', 'GET', start, res, Array.isArray(data) ? `Count: ${data.length}` : data);
        } catch (e: any) {
            console.error('Services fetch failed:', e);
            results.push({ endpoint: '/servicios', method: 'GET', status: 0, success: false, duration: 0, error: e.message });
        }

        // 6. Get Faculties
        try {
            const start = Date.now();
            const res = await fetch(`${API_URL}/facultades`);
            const data = await res.json();
            await logResult('/facultades', 'GET', start, res, Array.isArray(data) ? `Count: ${data.length}` : data);
        } catch (e: any) {
            console.error('Faculties fetch failed:', e);
            results.push({ endpoint: '/facultades', method: 'GET', status: 0, success: false, duration: 0, error: e.message });
        }
    }

    generateReport();
}

function generateReport() {
    console.log('\n📝 Generating Report...');
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const total = results.length;

    let md = `# API Test Report
**Date:** ${new Date().toLocaleString()}
**Summary:** ${passed}/${total} User Endpoints Passed

| Method | Endpoint | Status | Duration | Result |
|--------|----------|--------|----------|--------|
`;

    results.forEach(r => {
        md += `| ${r.method} | ${r.endpoint} | ${r.status} | ${r.duration}ms | ${r.success ? '✅ PASS' : '❌ FAIL'} |\n`;
    });

    md += `\n## Details\n`;
    results.forEach(r => {
        md += `### ${r.method} ${r.endpoint}\n`;
        md += `- **Status**: ${r.status}\n`;
        md += `- **Data**: \`\`\`json\n${JSON.stringify(r.data, null, 2)}\n\`\`\`\n`;
        if (r.error) {
            md += `- **Error**: \`\`\`json\n${JSON.stringify(r.error, null, 2)}\n\`\`\`\n`;
        }
    });

    fs.writeFileSync(REPORT_FILE, md);
    console.log(`Report saved to ${REPORT_FILE}`);
}

runTests();
