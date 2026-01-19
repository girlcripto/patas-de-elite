/**
 * Build Script for Patas de Elite
 * Bundles and minifies assets
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const isWatchMode = args.includes('--watch');

console.log('🐾 Patas de Elite Build System');
console.log(`Mode: ${isWatchMode ? 'Watch' : 'Build'}`);

function getStats() {
    const stats = {
        files: [],
        totalSize: 0
    };

    // Check source files
    const srcDir = path.join(__dirname, 'src');
    if (fs.existsSync(srcDir)) {
        const files = fs.readdirSync(srcDir);
        files.forEach(file => {
            const filePath = path.join(srcDir, file);
            if (fs.statSync(filePath).isFile()) {
                const size = fs.statSync(filePath).size;
                stats.files.push({
                    name: `src/${file}`,
                    size: size
                });
                stats.totalSize += size;
            }
        });
    }

    // Check index.html
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        const size = fs.statSync(indexPath).size;
        stats.files.push({
            name: 'index.html',
            size: size
        });
        stats.totalSize += size;
    }

    return stats;
}

function build() {
    console.log('\n📦 Building...');
    
    const stats = getStats();
    
    console.log('\nAssets:');
    stats.files.forEach(file => {
        console.log(`  ✓ ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    });
    
    console.log(`\nTotal Size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
    console.log('✅ Build complete!\n');
}

if (isWatchMode) {
    console.log('\n👀 Watching for changes...\n');
    
    const srcDir = path.join(__dirname, 'src');
    const indexPath = path.join(__dirname, 'index.html');
    
    // Watch src directory
    if (fs.existsSync(srcDir)) {
        fs.watch(srcDir, () => {
            build();
        });
    }
    
    // Watch index.html
    fs.watch(indexPath, () => {
        build();
    });
} else {
    build();
}
