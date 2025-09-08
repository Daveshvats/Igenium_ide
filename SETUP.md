# PostgreSQL Setup Instructions

## Database Configuration

Your project is now fully configured to use PostgreSQL with Neon database. All SQLite-specific code has been updated for PostgreSQL compatibility.

### Environment Variables

The setup script will automatically create a `.env` file with:

```env
# Database
DATABASE_URL="postgresql://neondb_owner:npg_fgahGqk3trW1@ep-lingering-smoke-a70s84j6-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# JWT Secret
JWT_SECRET="your-secret-key-here"
```

### Setup Commands

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup database (automated):**
   ```bash
   npm run db:setup
   ```

   This automated script will:
   - Create `.env` file with your Neon database connection
   - Generate Prisma client for PostgreSQL
   - Push schema to PostgreSQL database
   - Create admin user with specified credentials

3. **Start development server:**
   ```bash
   npm run dev
   ```

### Admin User

The setup script creates an admin user with:
- **Username:** `hellblazer`
- **Password:** `Egon_the_dragon_slayer`
- **Email:** `admin@idearpit.com`
- **Role:** `ADMIN`

### Registration

- Both admin and user registration options are available on the registration page
- Admin users can be created through the UI or database seed script

### Manual Database Operations

If you need to run database operations manually:

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Seed database (create admin user)
npm run db:seed

# View database in Prisma Studio
npx prisma studio
```

### Deployment

For production deployment:

1. Set the `DATABASE_URL` environment variable in your hosting platform
2. Run `npm run db:setup` to initialize the database
3. Deploy your application

The application is now ready for PostgreSQL deployment!
