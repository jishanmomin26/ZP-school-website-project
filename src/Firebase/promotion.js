import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './config';

// 🔥 Dynamic Academic Year
const getNextAcademicYear = () => {
  const today = new Date();
  let year = today.getFullYear();

  // Academic year starts from June
  if (today.getMonth() < 5) {
    year = year - 1;
  }

  return `${year}-${(year + 1).toString().slice(-2)}`;
};

export const promoteStudents = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'students'));

    const nextYear = getNextAcademicYear();

    const promises = snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();

      // skip graduated
      if (data.graduated) return;

      let newClass = Number(data.class) + 1;

      // 🎓 Graduation logic
      if (newClass > 4) {
        return updateDoc(doc(db, 'students', docSnap.id), {
          graduated: true,
          class: "Graduated",
          academicYear: nextYear
        });
      }

      // 🔼 Promotion
      return updateDoc(doc(db, 'students', docSnap.id), {
        class: String(newClass),
        academicYear: nextYear
      });
    });

    await Promise.all(promises);

    return { success: true };

  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
};