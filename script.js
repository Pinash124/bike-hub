const fs = require('fs');
const data = JSON.parse(fs.readFileSync('openapi_remote.json', 'utf8'));

const paymentPaths = Object.keys(data.paths).filter(p => p.includes('payment'));
console.log('Payment Paths:', paymentPaths);

for (const p of paymentPaths) {
    const methods = Object.keys(data.paths[p]);
    for (const m of methods) {
        const details = data.paths[p][m];
        console.log(`\nEndpoint: ${m.toUpperCase()} ${p}`);
        if (details.requestBody && details.requestBody.content['application/json']) {
            const ref = details.requestBody.content['application/json'].schema.$ref;
            if (ref) {
                const schemaName = ref.split('/').pop();
                console.log('Request Body Component:', schemaName);
                console.log(JSON.stringify(data.components.schemas[schemaName].properties, null, 2));
            } else {
                console.log('Request Body Schema:', JSON.stringify(details.requestBody.content['application/json'].schema, null, 2));
            }
        }
    }
}
