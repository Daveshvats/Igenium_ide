const { execSync } = require('child_process');

console.log('🗄️ Setting up database...\n');

try {
  // Setup database
  console.log('📊 Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema pushed!');

  // Seed the database
  console.log('\n🌱 Seeding database...');
  execSync('npm run db:seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully!');

  console.log('\n📋 Admin user created:');
  console.log('   Username: hellblazer');
  console.log('   Password: Egon_the_dragon_slayer');
  console.log('   Email: admin@idearpit.com');
  console.log('   Role: ADMIN');

} catch (error) {
  console.error('\n❌ Database setup failed:', error.message);
  process.exit(1);
}
