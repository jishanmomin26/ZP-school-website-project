const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with demo data...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zpkudave.edu.in' },
    update: {},
    create: {
      firebaseUid: 'mock-admin-uid-123', // In a real app this would be an actual firebase uid
      email: 'admin@zpkudave.edu.in',
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  // Create demo teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@zpkudave.edu.in' },
    update: {},
    create: {
      firebaseUid: 'mock-teacher-uid-456',
      email: 'teacher@zpkudave.edu.in',
      name: 'Sou. Ranjita Pardeshi',
      role: 'TEACHER',
    },
  });

  // Create demo parent
  const parent = await prisma.user.upsert({
    where: { parentId: 'PARENT001' },
    update: {},
    create: {
      firebaseUid: 'mock-parent-uid-789',
      parentId: 'PARENT001',
      name: 'Ramesh Patil',
      role: 'PARENT',
      parentProfile: {
        create: {
          studentName: 'Aarav Patil',
          studentClass: '3',
          studentRoll: 5,
        }
      }
    },
  });

  // Create students (Class 1-4)
  const studentsToCreate = [
    // Class 1
    { name: "Aarav Sharma", class: "1", rollNumber: 1 },
    { name: "Priya Patil", class: "1", rollNumber: 2 },
    { name: "Rohan Jadhav", class: "1", rollNumber: 3 },
    { name: "Sneha More", class: "1", rollNumber: 4 },
    { name: "Vihaan Pawar", class: "1", rollNumber: 5 },
    // Class 2
    { name: "Ananya Deshmukh", class: "2", rollNumber: 1 },
    { name: "Arjun Shinde", class: "2", rollNumber: 2 },
    { name: "Kavya Bhosale", class: "2", rollNumber: 3 },
    { name: "Ishaan Kadam", class: "2", rollNumber: 4 },
    { name: "Meera Gaikwad", class: "2", rollNumber: 5 },
    // Class 3
    { name: "Aditya Mane", class: "3", rollNumber: 1 },
    { name: "Sakshi Sawant", class: "3", rollNumber: 2 },
    { name: "Yash Kale", class: "3", rollNumber: 3 },
    { name: "Riya Nikam", class: "3", rollNumber: 4 },
    { name: "Aarav Patil", class: "3", rollNumber: 5 },
    // Class 4
    { name: "Tanvi Chavan", class: "4", rollNumber: 1 },
    { name: "Pranav Thakur", class: "4", rollNumber: 2 },
    { name: "Diya Salunkhe", class: "4", rollNumber: 3 },
    { name: "Om Ghule", class: "4", rollNumber: 4 },
    { name: "Nisha Wagh", class: "4", rollNumber: 5 },
  ];

  for (const s of studentsToCreate) {
    await prisma.student.upsert({
      where: { class_rollNumber: { class: s.class, rollNumber: s.rollNumber } },
      update: {},
      create: s,
    });
  }

  // Create some notices
  const noticesToCreate = [
    {
      title: "Annual Sports Day 2026",
      content: "Annual Sports Day will be held on 25th April 2026. All students must participate.",
      date: new Date("2026-04-10"),
      isImportant: true,
      createdBy: admin.id
    },
    {
      title: "Parent-Teacher Meeting",
      content: "PTM scheduled for 15th April 2026 at 10:00 AM. All parents are requested to attend.",
      date: new Date("2026-04-08"),
      isImportant: true,
      createdBy: admin.id
    },
    {
      title: "Summer Vacation Notice",
      content: "Summer vacation starts from 1st May to 15th June 2026.",
      date: new Date("2026-04-05"),
      isImportant: false,
      createdBy: admin.id
    }
  ];

  await prisma.notice.deleteMany({}); // clear for idempotency
  await prisma.notice.createMany({
    data: noticesToCreate
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
