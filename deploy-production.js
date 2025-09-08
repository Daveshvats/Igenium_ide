const { execSync } = require('child_process');

console.log('🚀 Starting production deployment setup...\n');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated!');

  // Push schema to database
  console.log('\n🗄️ Pushing schema to PostgreSQL database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Schema pushed to database!');

  // Seed the database
  console.log('\n🌱 Seeding database with admin user...');
  execSync('npm run db:seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully!');

  console.log('\n🎉 Production setup complete!');
  console.log('\n📋 Admin user created:');
  console.log('   Username: hellblazer');
  console.log('   Password: Egon_the_dragon_slayer');
  console.log('   Email: admin@idearpit.com');
  console.log('   Role: ADMIN');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  console.log('\n🔧 Manual setup required:');
  console.log('1. Run: npx prisma generate');
  console.log('2. Run: npx prisma db push');
  console.log('3. Run: npm run db:seed');
  process.exit(1);
}
