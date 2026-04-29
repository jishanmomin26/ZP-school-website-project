import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where
} from 'firebase/firestore';
import { auth, db } from './config.js';


// //=======//=======//========
// 🔐 REGISTER TEACHER
// //=======//=======//========
export const registerTeacher = async ({ name, email, password }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: name || '',
      email,
      role: 'teacher',
      createdAt: new Date().toISOString()
    });

    return { success: true, user };

  } catch (error) {
    return { success: false, error: getFirebaseErrorMessage(error.code) };
  }
};


// //=======//=======//========
// 👨‍👩‍👧 REGISTER PARENT
// //=======//=======//========
export const registerParent = async ({ name, email, password, parentId }) => {
  try {
    parentId = parentId.trim().toUpperCase(); // 🔥 normalize

    const existingParentQuery = query(
      collection(db, 'users'),
      where('parentId', '==', parentId)
    );

    const existingParentSnapshot = await getDocs(existingParentQuery);

    if (!existingParentSnapshot.empty) {
      return { success: false, error: 'Parent ID already exists.' };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: name || '',
      email,
      parentId,
      studentId: null,
      role: 'parent',
      createdAt: new Date().toISOString()
    });

    return { success: true, user };

  } catch (error) {
    return { success: false, error: getFirebaseErrorMessage(error.code) };
  }
};


// //=======//=======//========
// 👨‍🏫 LOGIN TEACHER
// //=======//=======//========
export const loginTeacher = async ({ email, password }) => {
  try {
    email = email.trim();

    // 🔒 Restrict to one teacher
    if (email !== "rzpschoolkudave1956@gmail.com") {
      return { success: false, error: "Only authorized teacher can login." };
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return { success: true, user };

  } catch (error) {
    return { success: false, error: "Invalid email or password" };
  }
};


// //=======//=======//========
// 👨‍👩‍👧 LOGIN PARENT
// //=======//=======//========
export const loginParent = async ({ parentId, password }) => {
  try {
    parentId = parentId.trim().toUpperCase(); // 🔥 normalize

    const parentQuery = query(
      collection(db, 'users'),
      where('parentId', '==', parentId),
      where('role', '==', 'parent')
    );

    const parentSnapshot = await getDocs(parentQuery);

    if (parentSnapshot.empty) {
      return { success: false, error: 'Parent ID not found.' };
    }

    const parentDoc = parentSnapshot.docs[0];
    const parentData = parentDoc.data();

    const userCredential = await signInWithEmailAndPassword(
      auth,
      parentData.email,
      password
    );

    const user = userCredential.user;

    return { success: true, user, userData: parentData, parentId: parentData.parentId };

  } catch (error) {
    if (error.code === 'auth/wrong-password') {
      return { success: false, error: 'Incorrect password' };
    }
    return { success: false, error: getFirebaseErrorMessage(error.code) };
  }
};


// //=======//=======//========
// 🚪 LOGOUT
// //=======//=======//========
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: getFirebaseErrorMessage(error.code) };
  }
};


// //=======//=======//========
// ⚠️ ERROR HANDLER
// //=======//=======//========
const getFirebaseErrorMessage = (code) => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-not-found':
      return 'User not found.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-credential':
      return 'Invalid login credentials.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
};