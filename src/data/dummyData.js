export const students = [
  // Class 1
  { id: 1, name: "Aarav Sharma", class: "1", roll: 1 },
  { id: 2, name: "Priya Patil", class: "1", roll: 2 },
  { id: 3, name: "Rohan Jadhav", class: "1", roll: 3 },
  { id: 4, name: "Sneha More", class: "1", roll: 4 },
  { id: 5, name: "Vihaan Pawar", class: "1", roll: 5 },
  // Class 2
  { id: 6, name: "Ananya Deshmukh", class: "2", roll: 1 },
  { id: 7, name: "Arjun Shinde", class: "2", roll: 2 },
  { id: 8, name: "Kavya Bhosale", class: "2", roll: 3 },
  { id: 9, name: "Ishaan Kadam", class: "2", roll: 4 },
  { id: 10, name: "Meera Gaikwad", class: "2", roll: 5 },
  // Class 3
  { id: 11, name: "Aditya Mane", class: "3", roll: 1 },
  { id: 12, name: "Sakshi Sawant", class: "3", roll: 2 },
  { id: 13, name: "Yash Kale", class: "3", roll: 3 },
  { id: 14, name: "Riya Nikam", class: "3", roll: 4 },
  { id: 15, name: "Aarav Patil", class: "3", roll: 5 },
  // Class 4
  { id: 16, name: "Tanvi Chavan", class: "4", roll: 1 },
  { id: 17, name: "Pranav Thakur", class: "4", roll: 2 },
  { id: 18, name: "Diya Salunkhe", class: "4", roll: 3 },
  { id: 19, name: "Om Ghule", class: "4", roll: 4 },
  { id: 20, name: "Nisha Wagh", class: "4", roll: 5 },
];

export const notices = [
  {
    id: 1,
    title: "Annual Sports Day 2026",
    content: "Annual Sports Day will be held on 25th April 2026. All students must participate.",
    date: "2026-04-10",
    important: true,
  },
  {
    id: 2,
    title: "Parent-Teacher Meeting",
    content: "PTM scheduled for 15th April 2026 at 10:00 AM. All parents are requested to attend.",
    date: "2026-04-08",
    important: true,
  },
  {
    id: 3,
    title: "Summer Vacation Notice",
    content: "Summer vacation starts from 1st May to 15th June 2026.",
    date: "2026-04-05",
    important: false,
  },
  {
    id: 4,
    title: "Mid-Day Meal Menu Updated",
    content: "New nutritious meal menu has been updated for the month of April.",
    date: "2026-04-01",
    important: false,
  },
  {
    id: 5,
    title: "Republic Day Celebration",
    content: "Republic Day was celebrated with great enthusiasm. Thank you to all participants.",
    date: "2026-01-26",
    important: false,
  },
];

export const defaultAttendanceHistory = [
  { date: "2026-04-10", class: "1", present: [1, 2, 3, 5], absent: [4] },
  { date: "2026-04-10", class: "2", present: [6, 7, 8, 10], absent: [9] },
  { date: "2026-04-10", class: "3", present: [11, 12, 14, 15], absent: [13] },
  { date: "2026-04-10", class: "4", present: [16, 17, 18, 19], absent: [20] },
  { date: "2026-04-09", class: "1", present: [1, 3, 4, 5], absent: [2] },
  { date: "2026-04-09", class: "2", present: [6, 7, 9, 10], absent: [8] },
  { date: "2026-04-09", class: "3", present: [11, 13, 14, 15], absent: [12] },
  { date: "2026-04-09", class: "4", present: [16, 17, 18, 20], absent: [19] },
  { date: "2026-04-08", class: "1", present: [1, 2, 3, 4], absent: [5] },
  { date: "2026-04-08", class: "2", present: [7, 8, 9, 10], absent: [6] },
  { date: "2026-04-08", class: "3", present: [11, 12, 13, 15], absent: [14] },
  { date: "2026-04-08", class: "4", present: [16, 18, 19, 20], absent: [17] },
  { date: "2026-04-07", class: "1", present: [1, 2, 4, 5], absent: [3] },
  { date: "2026-04-07", class: "2", present: [6, 8, 9, 10], absent: [7] },
  { date: "2026-04-07", class: "3", present: [12, 13, 14, 15], absent: [11] },
  { date: "2026-04-07", class: "4", present: [16, 17, 19, 20], absent: [18] },
  { date: "2026-04-04", class: "1", present: [1, 2, 3, 5], absent: [4] },
  { date: "2026-04-04", class: "2", present: [6, 7, 8, 9], absent: [10] },
  { date: "2026-04-04", class: "3", present: [11, 12, 14, 15], absent: [13] },
  { date: "2026-04-04", class: "4", present: [16, 17, 18, 20], absent: [19] },
  { date: "2026-04-03", class: "3", present: [11, 14, 15], absent: [12, 13] },
  { date: "2026-04-02", class: "3", present: [11, 12, 13, 14], absent: [15] },
  { date: "2026-04-01", class: "3", present: [12, 13, 14, 15], absent: [11] },
  { date: "2026-03-31", class: "3", present: [11, 12, 13, 15], absent: [14] },
  { date: "2026-03-28", class: "3", present: [11, 13, 14, 15], absent: [12] },
];

export const defaultResults = {
  "3": {
    UT1: [
      { studentId: 15, marathi: 42, english: 38, maths: 45, evs: 40 },
      { studentId: 11, marathi: 35, english: 30, maths: 40, evs: 38 },
      { studentId: 12, marathi: 44, english: 42, maths: 48, evs: 45 },
      { studentId: 13, marathi: 38, english: 35, maths: 42, evs: 36 },
      { studentId: 14, marathi: 40, english: 37, maths: 44, evs: 41 },
    ],
    UT2: [
      { studentId: 15, marathi: 44, english: 40, maths: 46, evs: 42 },
      { studentId: 11, marathi: 38, english: 33, maths: 42, evs: 40 },
      { studentId: 12, marathi: 46, english: 44, maths: 50, evs: 47 },
      { studentId: 13, marathi: 40, english: 37, maths: 44, evs: 38 },
      { studentId: 14, marathi: 42, english: 39, maths: 46, evs: 43 },
    ],
    "Semester 1": [
      { studentId: 15, marathi: 85, english: 78, maths: 90, evs: 82 },
      { studentId: 11, marathi: 72, english: 65, maths: 80, evs: 75 },
      { studentId: 12, marathi: 88, english: 85, maths: 95, evs: 90 },
      { studentId: 13, marathi: 76, english: 70, maths: 82, evs: 74 },
      { studentId: 14, marathi: 80, english: 75, maths: 88, evs: 84 },
    ],
    "Semester 2": [
      { studentId: 15, marathi: 88, english: 80, maths: 92, evs: 85 },
      { studentId: 11, marathi: 75, english: 68, maths: 82, evs: 78 },
      { studentId: 12, marathi: 90, english: 87, maths: 96, evs: 92 },
      { studentId: 13, marathi: 78, english: 72, maths: 84, evs: 76 },
      { studentId: 14, marathi: 82, english: 77, maths: 90, evs: 86 },
    ],
  }
};

export const galleryImages = [
  { id: 1, src: "/images/school-1.jpg", alt: "Students celebrating with balloons" },
  { id: 2, src: "/images/school-2.jpg", alt: "Students showcasing Warli art" },
  { id: 3, src: "/images/school-3.jpg", alt: "Classroom activity" },
  { id: 4, src: "/images/school-4.jpg", alt: "Students in classroom" },
  { id: 5, src: "/images/school-5.jpg", alt: "Independence Day celebration" },
  { id: 6, src: "/images/school-6.jpg", alt: "Cultural event" },
  { id: 7, src: "/images/school-7.jpg", alt: "School snacks distribution" },
  { id: 8, src: "/images/school-8.jpg", alt: "First day at school" },
];

export const getGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 35) return 'D';
  return 'F';
};

export const getGradeColor = (grade) => {
  const colors = {
    'A+': 'text-emerald-600 bg-emerald-50',
    'A': 'text-green-600 bg-green-50',
    'B+': 'text-blue-600 bg-blue-50',
    'B': 'text-sky-600 bg-sky-50',
    'C': 'text-amber-600 bg-amber-50',
    'D': 'text-orange-600 bg-orange-50',
    'F': 'text-red-600 bg-red-50',
  };
  return colors[grade] || 'text-dark-600 bg-dark-50';
};
