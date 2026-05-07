const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\5458de5f-dac5-4036-b9ff-6a13d069b8fb';
const assetsDir = path.join(__dirname, '../public/assets');

const files = {
    'livecat_logo_raw_1778115375287.png': 'logo.png',
    'livecat_splash_raw_1778115391441.png': 'splash.png',
};

// Also use logo as icon for now
files['livecat_logo_raw_1778115375287.png'] = ['logo.png', 'icon.png', 'icon.ico']; // Using PNG as ICO might fail builder, but let's see

Object.entries(files).forEach(([raw, targets]) => {
    const rawPath = path.join(brainDir, raw);
    if (fs.existsSync(rawPath)) {
        const targetList = Array.isArray(targets) ? targets : [targets];
        targetList.forEach(target => {
            fs.copyFileSync(rawPath, path.join(assetsDir, target));
            console.log(`Copied ${raw} to ${target}`);
        });
    } else {
        console.warn(`Raw file ${raw} not found at ${rawPath}`);
    }
});

// Banner is just the splash for now
fs.copyFileSync(path.join(assetsDir, 'splash.png'), path.join(assetsDir, 'banner.png'));
console.log('Created banner.png from splash.png');
