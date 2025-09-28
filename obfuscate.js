const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// Obfuscation options
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    numbersToExpressions: true,
    simplify: true,
    stringArrayShuffle: true,
    splitStrings: true,
    stringArray: true,
    stringArrayThreshold: 1,
    transformObjectKeys: true,
    unicodeEscapeSequence: true
};

// Function to obfuscate JavaScript
function obfuscateJS(inputFile, outputFile) {
    try {
        const sourceCode = fs.readFileSync(inputFile, 'utf8');
        const obfuscatedCode = JavaScriptObfuscator.obfuscate(sourceCode, obfuscationOptions);
        
        fs.writeFileSync(outputFile, obfuscatedCode.getObfuscatedCode());
        console.log(`✅ JavaScript obfuscated: ${inputFile} → ${outputFile}`);
    } catch (error) {
        console.error(`❌ Error obfuscating ${inputFile}:`, error.message);
    }
}

// Function to minify HTML
function minifyHTML(inputFile, outputFile) {
    try {
        let html = fs.readFileSync(inputFile, 'utf8');
        
        // Remove comments
        html = html.replace(/<!--[\s\S]*?-->/g, '');
        
        // Remove extra whitespace
        html = html.replace(/\s+/g, ' ');
        html = html.replace(/>\s+</g, '><');
        
        // Remove empty lines
        html = html.replace(/\n\s*\n/g, '\n');
        
        fs.writeFileSync(outputFile, html.trim());
        console.log(`✅ HTML minified: ${inputFile} → ${outputFile}`);
    } catch (error) {
        console.error(`❌ Error minifying ${inputFile}:`, error.message);
    }
}

// Function to minify CSS
function minifyCSS(inputFile, outputFile) {
    try {
        let css = fs.readFileSync(inputFile, 'utf8');
        
        // Remove comments
        css = css.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Remove extra whitespace
        css = css.replace(/\s+/g, ' ');
        css = css.replace(/;\s*}/g, '}');
        css = css.replace(/{\s*/g, '{');
        css = css.replace(/;\s*/g, ';');
        
        // Remove empty lines
        css = css.replace(/\n\s*\n/g, '\n');
        
        fs.writeFileSync(outputFile, css.trim());
        console.log(`✅ CSS minified: ${inputFile} → ${outputFile}`);
    } catch (error) {
        console.error(`❌ Error minifying ${inputFile}:`, error.message);
    }
}

// Main obfuscation function
function obfuscateAll() {
    console.log('🔒 Starting obfuscation process...\n');
    
    // Create obfuscated directory
    const obfuscatedDir = 'obfuscated';
    if (!fs.existsSync(obfuscatedDir)) {
        fs.mkdirSync(obfuscatedDir);
    }
    
    // Obfuscate JavaScript
    obfuscateJS('script.js', path.join(obfuscatedDir, 'script.js'));
    
    // Minify HTML
    minifyHTML('index.html', path.join(obfuscatedDir, 'index.html'));
    
    // Minify CSS
    minifyCSS('styles.css', path.join(obfuscatedDir, 'styles.css'));
    
    // Copy static files
    const staticDir = path.join(obfuscatedDir, 'static');
    if (!fs.existsSync(staticDir)) {
        fs.mkdirSync(staticDir, { recursive: true });
    }
    
    // Copy favicon
    if (fs.existsSync('favicon.ico')) {
        fs.copyFileSync('favicon.ico', path.join(obfuscatedDir, 'favicon.ico'));
        console.log('✅ Favicon copied');
    }
    
    console.log('\n🎉 Obfuscation complete! Check the "obfuscated" folder.');
    console.log('📁 Deploy the contents of the "obfuscated" folder to your server.');
}

// Run obfuscation
if (require.main === module) {
    obfuscateAll();
}

module.exports = { obfuscateAll, obfuscateJS, minifyHTML, minifyCSS };
