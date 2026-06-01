import bcrypt from 'bcryptjs'
import prisma from './prisma.js'

export async function seedDatabase() {
  console.log('Seeding database...')

  // Create 7 branches
  const branches = await Promise.all([
    prisma.branch.upsert({
      where: { id: 'london' },
      update: { isMain: true },
      create: { id: 'london', name: 'London Flagship', address: '1 Oxford St', city: 'London', isMain: true }
    }),
    prisma.branch.upsert({ where: { id: 'manchester' }, update: {}, create: { id: 'manchester', name: 'Manchester', address: '5 Deansgate', city: 'Manchester' } }),
    prisma.branch.upsert({ where: { id: 'birmingham' }, update: {}, create: { id: 'birmingham', name: 'Birmingham', address: '10 Broad St', city: 'Birmingham' } }),
    prisma.branch.upsert({ where: { id: 'leeds' }, update: {}, create: { id: 'leeds', name: 'Leeds', address: '3 The Headrow', city: 'Leeds' } }),
    prisma.branch.upsert({ where: { id: 'edinburgh' }, update: {}, create: { id: 'edinburgh', name: 'Edinburgh', address: '7 Royal Mile', city: 'Edinburgh' } }),
    prisma.branch.upsert({ where: { id: 'bristol' }, update: {}, create: { id: 'bristol', name: 'Bristol', address: '2 Park St', city: 'Bristol' } }),
    prisma.branch.upsert({ where: { id: 'liverpool' }, update: {}, create: { id: 'liverpool', name: 'Liverpool', address: '4 Albert Dock', city: 'Liverpool' } }),
  ])

  console.log(`✅ ${branches.length} branches created`)

  // Create one user per role
  const hash = (pw: string) => bcrypt.hash(pw, 10)

  await Promise.all([
    prisma.user.upsert({ where: { email: 'admin@steakz.com' }, update: {}, create: { email: 'admin@steakz.com', name: 'Admin User', role: 'ADMIN', password: await hash('Admin123!'), branchId: null } }),
    prisma.user.upsert({ where: { email: 'hm@steakz.com' }, update: {}, create: { email: 'hm@steakz.com', name: 'HQ Manager', role: 'HM', password: await hash('HM123!'), branchId: null } }),
    prisma.user.upsert({ where: { email: 'bm@steakz.com' }, update: {}, create: { email: 'bm@steakz.com', name: 'Branch Manager', role: 'BM', password: await hash('BM123!'), branchId: 'london' } }),
    prisma.user.upsert({ where: { email: 'chef@steakz.com' }, update: {}, create: { email: 'chef@steakz.com', name: 'Head Chef', role: 'CHEF', password: await hash('Chef123!'), branchId: 'london' } }),
    prisma.user.upsert({ where: { email: 'cashier@steakz.com' }, update: {}, create: { email: 'cashier@steakz.com', name: 'Cashier', role: 'CASHIER', password: await hash('Cash123!'), branchId: 'london' } }),
    prisma.user.upsert({ where: { email: 'waiter@steakz.com' }, update: {}, create: { email: 'waiter@steakz.com', name: 'Waiter', role: 'WAITER', password: await hash('Wait123!'), branchId: 'london' } }),
  ])

  console.log('✅ 6 users created')

  // Create tables for London branch
  const tableCount = await prisma.table.count({ where: { branchId: 'london' } })
  if (tableCount === 0) {
    await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        prisma.table.create({
          data: {
            number: i + 1,
            seats: i % 3 === 0 ? 2 : i % 3 === 1 ? 4 : 6,
            branchId: 'london'
          }
        })
      )
    )
    console.log('✅ 10 tables created for London branch')
  }

  console.log('✅ Seed complete!')
}