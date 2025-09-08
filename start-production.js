const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production application...\n');

async function startApp() {
  try {
    // Check if database setup is needed
    const dbSetupFile = path.join(__dirname, '.db-setup-complete');
    
    if (!fs.existsSync(dbSetupFile)) {
      console.log('🗄️ First run - setting up database...');
      
      try {
        // Setup database
        console.log('📊 Pushing schema to database...');
        execSync('npx prisma db push', { stdio: 'inherit' });
        console.log('✅ Database schema pushed!');

        // Seed the database
        console.log('🌱 Seeding database...');
        execSync('npm run db:seed', { stdio: 'inherit' });
        console.log('✅ Database seeded successfully!');

        // Mark database setup as complete
        fs.writeFileSync(dbSetupFile, new Date().toISOString());
        console.log('✅ Database setup completed!');
        
      } catch (dbError) {
        console.log('⚠️ Database setup failed, continuing with app start...');
        console.log('Database setup error:', dbError.message);
      }
    } else {
      console.log('✅ Database already set up, starting application...');
    }

    // Start the Next.js application
    console.log('\n🚀 Starting Next.js application...');
    execSync('npm start', { stdio: 'inherit' });

  } catch (error) {
    console.error('\n❌ Application start failed:', error.message);
    process.exit(1);
  }
}

startApp();
