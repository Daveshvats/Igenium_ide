const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Setting up PostgreSQL for IdeaRpit...\n');

try {
  // Create .env file
  console.log('📝 Creating .env file...');
  const envContent = `DATABASE_URL="postgresql://neondb_owner:npg_fgahGqk3trW1@ep-lingering-smoke-a70s84j6-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="your-secret-key-here"`;
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created successfully!');

  // Generate Prisma client
  console.log('\n📦 Generating Prisma client...');
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

  console.log('\n🎉 PostgreSQL setup complete!');
  console.log('\n📋 Admin user created:');
  console.log('   Username: hellblazer');
  console.log('   Password: Egon_the_dragon_slayer');
  console.log('   Email: admin@idearpit.com');
  console.log('   Role: ADMIN');
  
  console.log('\n🚀 You can now start the development server with:');
  console.log('   npm run dev');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  console.log('\n🔧 Manual setup required:');
  console.log('1. Create .env file with DATABASE_URL and JWT_SECRET');
  console.log('2. Run: npx prisma generate');
  console.log('3. Run: npx prisma db push');
  console.log('4. Run: npm run db:seed');
  process.exit(1);
}
