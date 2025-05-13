import { initializeApp } from 'firebase/app';
import {
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

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    console.error('Firebase persistence error:', err);
  });

// Collection references
export const portugueseFoodsRef = collection(db, 'portuguese_foods');
export const getUserMealsRef = (userId: string) => 
  collection(db, 'users', userId, 'meals');

// Food interface
export interface Food {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
}

// Meal interface
export interface Meal {
  foodId: string;
  userId: string;
  timestamp: Date;
  quantity: number;
}

// Firebase service functions
export const saveMeal = async (userId: string, meal: Omit<Meal, 'userId'>) => {
  const mealRef = doc(getUserMealsRef(userId));
  await setDoc(mealRef, {
    ...meal,
    userId,
    timestamp: new Date()
  });
};

export const getFoodByName = async (name: string): Promise<Food | null> => {
  const q = query(portugueseFoodsRef, where("name", "==", name));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  return snapshot.docs[0].data() as Food;
};

export const getUserDailyCalories = async (userId: string, date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const q = query(
    getUserMealsRef(userId),
    where("timestamp", ">=", startOfDay),
    where("timestamp", "<=", endOfDay)
  );
  
  const snapshot = await getDocs(q);
  let totalCalories = 0;
  
  for (const doc of snapshot.docs) {
    const meal = doc.data() as Meal;
    const food = await getDoc(doc(portugueseFoodsRef, meal.foodId));
    if (food.exists()) {
      const foodData = food.data() as Food;
      totalCalories += foodData.calories * meal.quantity;
    }
  }
  
  return totalCalories;
};

export default db; 