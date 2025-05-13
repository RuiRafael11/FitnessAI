import { initializeApp } from 'firebase/app';
import {
  User,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signOut
} from 'firebase/auth';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  enableIndexedDbPersistence,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where
} from 'firebase/firestore';

// Types
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface Food {
  id: string;
  name: string;
  calories: number;
  imageUrl?: string;
  description?: string;
  category?: string;
  servingSize?: string;
}

export interface Meal {
  id: string;
  foodId: string;
  timestamp: Date;
  calories: number;
  quantity: number;
  notes?: string;
}

export interface DailyCalorieSummary {
  totalCalories: number;
  meals: Meal[];
  date: Date;
}

// Firebase config should be loaded from environment variables
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable offline persistence with error handling
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
} catch (err) {
  console.error('Firebase persistence error:', err);
}

// Collection references
export const portugueseFoodsRef = collection(db, 'portuguese_foods');
export const getUserMealsRef = (userId: string) => 
  collection(db, 'users', userId, 'meals');

// Authentication functions
export const signInAnonymouslyUser = async (): Promise<User> => {
  try {
    const { user } = await signInAnonymously(auth);
    return user;
  } catch (error) {
    console.error('Anonymous sign-in error:', error);
    throw new Error('Failed to sign in anonymously');
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firebase service functions with improved error handling
export const saveMeal = async (userId: string, meal: Omit<Meal, 'id'>): Promise<string> => {
  try {
    const mealsRef = getUserMealsRef(userId);
    const docRef = await addDoc(mealsRef, {
      ...meal,
      timestamp: Timestamp.fromDate(meal.timestamp)
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving meal:', error);
    throw new Error('Failed to save meal');
  }
};

export const getFoodByName = async (name: string): Promise<Food | null> => {
  const foodsRef = collection(db, 'portuguese_foods');
  const q = query(foodsRef, where('name', '==', name.toLowerCase()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data() as Omit<Food, 'id'>
  };
};

export const getUserDailyCalories = async (userId: string, date: Date): Promise<DailyCalorieSummary> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const q = query(
      getUserMealsRef(userId),
      where("timestamp", ">=", Timestamp.fromDate(startOfDay)),
      where("timestamp", "<=", Timestamp.fromDate(endOfDay))
    );
    
    const snapshot = await getDocs(q);
    let totalCalories = 0;
    const meals: Meal[] = [];
    
    for (const docSnapshot of snapshot.docs) {
      const mealData = docSnapshot.data();
      const meal = {
        id: docSnapshot.id,
        ...mealData,
        timestamp: (mealData.timestamp as Timestamp).toDate()
      } as Meal;
      
      const foodDoc = await getDoc(doc(db, 'portuguese_foods', meal.foodId));
      if (foodDoc.exists()) {
        const foodData = foodDoc.data() as Food;
        totalCalories += foodData.calories * meal.quantity;
        meals.push(meal);
      }
    }
    
    return {
      totalCalories,
      meals,
      date
    };
  } catch (error) {
    console.error('Error getting daily calories:', error);
    throw new Error('Failed to get daily calories');
  }
};

export async function getMealsForDay(userId: string, date: Date): Promise<Meal[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const mealsRef = collection(db, `users/${userId}/meals`);
  const q = query(
    mealsRef,
    where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
    where('timestamp', '<=', Timestamp.fromDate(endOfDay))
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: (doc.data().timestamp as Timestamp).toDate()
  })) as Meal[];
}

// Preload Portuguese foods collection
export async function preloadPortugueseFoods() {
  const foods = [
    { name: 'bacalhau à brás', calories: 450, imageUrl: 'https://example.com/bacalhau.jpg' },
    { name: 'francesinha', calories: 1200, imageUrl: 'https://example.com/francesinha.jpg' },
    { name: 'caldo verde', calories: 200, imageUrl: 'https://example.com/caldo-verde.jpg' },
    { name: 'pastéis de nata', calories: 290, imageUrl: 'https://example.com/pastel-nata.jpg' },
    { name: 'bifana', calories: 350, imageUrl: 'https://example.com/bifana.jpg' },
    { name: 'sardinhas assadas', calories: 250, imageUrl: 'https://example.com/sardinhas.jpg' },
    { name: 'cozido à portuguesa', calories: 800, imageUrl: 'https://example.com/cozido.jpg' },
    { name: 'arroz de marisco', calories: 400, imageUrl: 'https://example.com/arroz-marisco.jpg' },
    { name: 'feijoada', calories: 600, imageUrl: 'https://example.com/feijoada.jpg' },
    { name: 'polvo à lagareiro', calories: 450, imageUrl: 'https://example.com/polvo.jpg' },
  ];

  const foodsRef = collection(db, 'portuguese_foods');
  
  for (const food of foods) {
    const docRef = doc(foodsRef, food.name.toLowerCase().replace(/\s+/g, '-'));
    await setDoc(docRef, food);
  }
}

export default db; 