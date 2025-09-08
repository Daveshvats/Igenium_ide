# IdeaRpit - Problem Solving Platform

A competitive programming platform with advanced judging system, built with Next.js, TypeScript, and Prisma.

## Features

### 🎯 Core Functionality
- **Problem Management**: Admins can create and manage coding problems with skeleton code
- **Code Execution**: Real-time code execution with multiple language support
- **Advanced Judging**: Evaluates both correctness and efficiency (time/space complexity)
- **Smart Scoring**: Bonus points for first correct solution and most efficient code

### 🔒 Security Features
- **Tab Restrictions**: Users cannot switch tabs or windows during problem solving
- **Developer Tools Blocking**: Prevents access to browser dev tools
- **Session Management**: Secure authentication with JWT tokens

### 👥 User Management
- **Role-based Access**: Separate interfaces for admins and participants
- **User Authentication**: Secure login/registration system
- **Session Tracking**: Persistent login sessions

### 🏆 Judging System
- **Multi-language Support**: JavaScript, Python, Java, C++
- **Test Case Management**: Hidden and visible test cases
- **Performance Metrics**: Execution time and memory usage tracking
- **Real-time Results**: Immediate feedback on code submissions

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Code Editor**: Monaco Editor (VS Code editor)
- **Authentication**: JWT with bcrypt password hashing
- **Code Execution**: Node.js child processes with timeout and memory limits

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd idearpit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

4. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### First Time Setup

1. **Create an admin account**
   - Go to `/register`
   - Select "Admin (Teacher/Judge)" role
   - Complete registration

2. **Create your first problem**
   - Login as admin
   - Go to Admin Panel
   - Click "Create New Problem"
   - Add test cases

3. **Test the platform**
   - Create a regular user account
   - Login and try solving problems

## Project Structure

```
idearpit/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── admin/         # Admin-only endpoints
│   │   │   ├── problems/      # Problem management
│   │   │   └── submissions/   # Code submission handling
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── login/             # Authentication pages
│   │   ├── problem/           # Problem solving interface
│   │   └── register/
│   ├── components/            # Reusable React components
│   │   └── TabRestriction.tsx # Tab switching prevention
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication state
│   └── lib/                   # Utility libraries
│       ├── auth.ts            # Authentication utilities
│       ├── codeExecutor.ts    # Code execution engine
│       ├── db.ts              # Database connection
│       └── utils.ts           # General utilities
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
└── public/                    # Static assets
```

## Database Schema

### Core Models
- **User**: User accounts with role-based access
- **Problem**: Coding problems with metadata
- **TestCase**: Input/output pairs for testing
- **Submission**: User code submissions with results
- **Session**: Authentication sessions

### Key Relationships
- Users can have multiple submissions
- Problems can have multiple test cases and submissions
- Sessions are linked to users for authentication

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Problems
- `GET /api/problems` - List all active problems
- `GET /api/problems/[id]` - Get problem details

### Admin
- `GET /api/admin/problems` - List all problems (admin)
- `POST /api/admin/problems` - Create new problem
- `PATCH /api/admin/problems/[id]` - Update problem
- `POST /api/admin/problems/[id]/test-cases` - Add test case

### Submissions
- `POST /api/submissions` - Submit solution
- `POST /api/submissions/test` - Test solution

## Security Features

### Tab Restriction
The platform implements strict tab/window switching prevention:
- Detects when user switches tabs or windows
- Shows warnings and forces focus back
- Blocks common keyboard shortcuts (F12, Ctrl+Shift+I, etc.)
- Disables right-click context menu

### Code Execution Security
- Timeout limits prevent infinite loops
- Memory limits prevent resource exhaustion
- Isolated execution environment
- Input validation and sanitization

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="your-secret-key-here"

# Optional: Production database
# DATABASE_URL="postgresql://user:password@localhost:5432/idearpit"
```

### Code Execution Limits
Default limits can be configured in the problem creation:
- **Time Limit**: 2000ms (2 seconds)
- **Memory Limit**: 128MB
- **Languages**: JavaScript, Python, Java, C++

## Deployment

### Production Setup

1. **Database Migration**
   ```bash
   npx prisma migrate deploy
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start production server**
   ```bash
   npm start
   ```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## Roadmap

### Planned Features
- [ ] Real-time leaderboards
- [ ] Contest management system
- [ ] Advanced code analysis
- [ ] Docker-based code execution
- [ ] Multi-language support expansion
- [ ] Mobile-responsive design improvements
- [ ] API rate limiting
- [ ] Email notifications

### Performance Improvements
- [ ] Code execution optimization
- [ ] Database query optimization
- [ ] Caching implementation
- [ ] CDN integration

---

**IdeaRpit** - Empowering competitive programming with advanced technology! 🚀