const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminEmail = 'admin@idearpit.com'
  const adminUsername = 'hellblazer'
  const adminPassword = 'Egon_the_dragon_slayer'

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { username: adminUsername }
      ]
    }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: adminUsername,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('Admin user created:', {
      id: admin.id,
      email: admin.email,
      username: admin.username,
      role: admin.role
    })
  } else {
    console.log('Admin user already exists')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
