const fs = require('fs');
const path = require('path');

function parseTranslations(file) {
    const source = fs.readFileSync(file, 'utf8');
    const declaration = source.indexOf('const translations = {');
    if (declaration < 0) throw new Error(`${file}: translations object not found`);
    const objectStart = source.indexOf('{', declaration);
    const boundary = file === 'i18n.js' ? source.length : source.indexOf('const isEmbedded', objectStart);
    const objectEnd = source.lastIndexOf('};', boundary);
    return Function(`return (${source.slice(objectStart, objectEnd + 1)})`)();
}

const checks = [
    ['index.html', 'i18n.js'],
    ['robotics-demo.html', 'robotics-demo.html'],
    ['shape-comparison.html', 'shape-comparison.html'],
    ['shape-features-demo.html', 'shape-features-demo.html']
];

for (const [htmlFile, dictionaryFile] of checks) {
    const html = fs.readFileSync(htmlFile, 'utf8');
    const dictionary = fs.readFileSync(dictionaryFile, 'utf8');
    const parsedTranslations = parseTranslations(dictionaryFile);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    const keys = [...new Set(
        [...html.matchAll(/data-i18n(?:-aria-label|-title)?="([^"]+)"/g)].map(match => match[1])
    )];
    const missing = keys.filter(key =>
        !new RegExp(`(?:^|[,\\s{])${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`, 'm')
            .test(dictionary));
    const missingEnglish = keys.filter(key => typeof parsedTranslations.en?.[key] !== 'string');
    const missingSpanish = keys.filter(key => typeof parsedTranslations.es?.[key] !== 'string');
    if (duplicates.length || missing.length || missingEnglish.length || missingSpanish.length) {
        throw new Error(`${htmlFile}: duplicate IDs ${duplicates}; missing keys ${missing}; missing EN ${missingEnglish}; missing ES ${missingSpanish}`);
    }
    console.log(`${htmlFile}: ${ids.length} unique IDs; ${keys.length} translation keys found`);
}

const index = fs.readFileSync('index.html', 'utf8');
for (const match of index.matchAll(/<iframe[^>]+src="([^"]+)"/g)) {
    if (/^https?:/.test(match[1])) continue;
    const localPath = match[1].split(/[?#]/, 1)[0];
    if (!fs.existsSync(path.resolve(localPath))) throw new Error(`Missing iframe ${match[1]}`);
    console.log(`iframe found: ${match[1]}`);
}
