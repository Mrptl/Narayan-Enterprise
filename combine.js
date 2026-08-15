const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const mappings = [
    { mobile: 'Narayan Enterprise - Home.html', desktop: 'Narayan Enterprise - Home (Desktop).html', output: 'index.html' },
    { mobile: 'About Us - Narayan Enterprise.html', desktop: 'About Us - Narayan Enterprise (Desktop).html', output: 'about.html' },
    { mobile: 'Industries - Applications.html', desktop: 'Industries & Applications (Desktop).html', output: 'industries.html' },
    { mobile: 'Products Catalog.html', desktop: 'Products Catalog (Desktop).html', output: 'products.html' },
    { mobile: 'Contact Us.html', desktop: 'Contact Us (Desktop).html', output: 'contact.html' }
];

const linkReplacements = [
    { regex: /^home$/i, replace: 'index.html' },
    { regex: /about/i, replace: 'about.html' },
    { regex: /industries|applications/i, replace: 'industries.html' },
    { regex: /products|catalog/i, replace: 'products.html' },
    { regex: /contact/i, replace: 'contact.html' }
];

function determineHref(text) {
    if (!text) return null;
    const clean = text.trim();
    if (!clean) return null;
    for (const r of linkReplacements) {
        if (r.regex.test(clean)) {
            return r.replace;
        }
    }
    // Specific edge cases where icons might be the text
    if (clean.toLowerCase().includes('home')) return 'index.html';
    return null;
}

function processLinks($) {
    $('a').each((i, el) => {
        const text = $(el).text().trim();
        const currentHref = $(el).attr('href');
        
        let newHref = determineHref(text);
        
        // Sometimes logo has no text or 'Narayan Enterprise' text
        if ($(el).find('img').length > 0 && !text) {
             newHref = 'index.html'; // Assume logo links to home
        }
        if (text.includes('Narayan Enterprise')) {
             newHref = 'index.html';
        }

        if (newHref) {
            $(el).attr('href', newHref);
        } 
    });
}

function combine() {
    for (const map of mappings) {
        if (!fs.existsSync(map.mobile)) {
            console.warn(`Mobile file missing: ${map.mobile}`);
            continue;
        }
        if (!fs.existsSync(map.desktop)) {
            console.warn(`Desktop file missing: ${map.desktop}`);
            continue;
        }

        const mobileHtml = fs.readFileSync(map.mobile, 'utf8');
        const desktopHtml = fs.readFileSync(map.desktop, 'utf8');

        // Load into cheerio
        const $m = cheerio.load(mobileHtml);
        const $d = cheerio.load(desktopHtml);

        // Process links in both bodies
        processLinks($m);
        processLinks($d);

        // Create the wrappers
        const mobileBodyContent = $m('body').html();
        const desktopBodyContent = $d('body').html();

        const combinedBody = `
<div class="block lg:hidden">
${mobileBodyContent}
</div>
<div class="hidden lg:block">
${desktopBodyContent}
</div>
        `;

        // We use the Desktop version as the base template
        const $template = cheerio.load(desktopHtml);
        $template('body').empty();
        $template('body').append(combinedBody);
        
        // Final pass for links just in case
        processLinks($template);

        fs.writeFileSync(map.output, $template.html(), 'utf8');
        console.log(`Generated: ${map.output}`);
    }
}

combine();
