const { cpSync, rmSync, existsSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

const backendRoot = join(__dirname, '..');
const frontendRoot = join(backendRoot, '..', 'admin-panel');
const publicDir = join(backendRoot, 'public');
const distDir = join(frontendRoot, 'dist');

console.log('Building admin-panel...');
execSync('npm run build', { cwd: frontendRoot, stdio: 'inherit' });

if (!existsSync(distDir)) {
  console.error('Frontend build output not found:', distDir);
  process.exit(1);
}

if (existsSync(publicDir)) {
  rmSync(publicDir, { recursive: true, force: true });
}

cpSync(distDir, publicDir, { recursive: true });
console.log('Frontend copied to backend/public');
