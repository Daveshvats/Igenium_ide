const { execSync } = require('child_process');

console.log('🚀 Starting simple build process...\n');

try {
  // Set production environment
  process.env.NODE_ENV = 'production';
  process.env.NEXT_TELEMETRY_DISABLED = '1';

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed!');

  // Generate Prisma client manually
  console.log('\n🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated!');

  // Build the application
  console.log('\n🏗️ Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application built successfully!');

  console.log('\n🎉 Build completed successfully!');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
