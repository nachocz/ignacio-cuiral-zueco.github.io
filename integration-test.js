const fs = require('fs');
const path = require('path');

const checks = [
    ['index.html', 'i18n.js'],
    ['robotics-demo.html', 'robotics-demo.html'],
    ['shape-comparison.html', 'shape-comparison.html'],
    ['shape-features-demo.html', 'shape-features-demo.html']
];

for (const [htmlFile, dictionaryFile] of checks) {
    const html = fs.readFileSync(htmlFile, 'utf8');
    const dictionary = fs.readFileSync(dictionaryFile, 'utf8');
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    const keys = [...new Set(
        [...html.matchAll(/data-i18n="([^"]+)"/g)].map(match => match[1])
    )];
    const missing = keys.filter(key =>
        !new RegExp(`(?:^|[,\\s{])${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`, 'm')
            .test(dictionary));
    if (duplicates.length || missing.length) {
        throw new Error(`${htmlFile}: duplicate IDs ${duplicates}; missing translations ${missing}`);
    }
    console.log(`${htmlFile}: ${ids.length} unique IDs; ${keys.length} translation keys found`);
}

const index = fs.readFileSync('index.html', 'utf8');
for (const match of index.matchAll(/<iframe[^>]+src="([^"]+)"/g)) {
    if (/^https?:/.test(match[1])) continue;
    if (!fs.existsSync(path.resolve(match[1]))) throw new Error(`Missing iframe ${match[1]}`);
    console.log(`iframe found: ${match[1]}`);
}
