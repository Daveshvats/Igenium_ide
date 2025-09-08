const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting production build process...\n');

try {
  // Set production environment
  process.env.NODE_ENV = 'production';
  process.env.NEXT_TELEMETRY_DISABLED = '1';

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm ci --only=production', { stdio: 'inherit' });
  console.log('✅ Dependencies installed!');

  // Generate Prisma client
  console.log('\n🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated!');

  // Build the application (without Turbopack for production)
  console.log('\n🏗️ Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application built successfully!');

  // Setup database
  console.log('\n🗄️ Setting up database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema pushed!');

  // Seed the database
  console.log('\n🌱 Seeding database...');
  execSync('npm run db:seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully!');

  console.log('\n🎉 Production build completed successfully!');
  console.log('\n📋 Admin user created:');
  console.log('   Username: hellblazer');
  console.log('   Password: Egon_the_dragon_slayer');
  console.log('   Email: admin@idearpit.com');
  console.log('   Role: ADMIN');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check environment variables are set correctly');
  console.log('2. Verify database connection');
  console.log('3. Check build logs for specific errors');
  process.exit(1);
}
