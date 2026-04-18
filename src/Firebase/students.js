import { collection, getDocs } from 'firebase/firestore';
import { db } from './config';

export const getStudents = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'students'));

    const students = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return students;

  } catch (error) {
    console.error(error);
    return [];
  }
};