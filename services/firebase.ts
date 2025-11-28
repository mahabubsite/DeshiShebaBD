
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, Timestamp, doc, updateDoc, deleteDoc, onSnapshot, setDoc, getDoc, orderBy, writeBatch, increment, limit } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { firebaseConfig, DEFAULT_CATEGORY_DEFINITIONS, MOCK_SERVICES } from '../constants';
import { ServiceEntry, ServiceStatus, UserProfile, UserDocument, CategoryDefinition, ReportDocument, NotificationDocument, BlogDocument } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Collection References
const servicesRef = collection(db, 'services');
const usersRef = collection(db, 'users');
const categoriesRef = collection(db, 'categories');
const reportsRef = collection(db, 'reports');
const notificationsRef = collection(db, 'notifications');
const blogsRef = collection(db, 'blogs');

// --- Helper: Sync User to Firestore ---
const syncUserToFirestore = async (user: User) => {
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const userSnap = await getDoc(userDocRef);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: Date.now()
    };

    if (!userSnap.exists()) {
      await setDoc(userDocRef, {
        ...userData,
        role: user.email === 'admin@deshisheba.com' ? 'admin' : 'user',
        isBanned: false,
        createdAt: Date.now(),
      });
    } else {
      await updateDoc(userDocRef, userData);
    }
  } catch (e) {
    console.warn("Failed to sync user to Firestore", e);
  }
};

// --- Auth Services ---
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    await syncUserToFirestore(result.user);
    return result.user;
  } catch (error) {
    console.error("Error signing in", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(result.user, { displayName: name });
        // Force a small delay to ensure Firestore write has time to propagate
        await syncUserToFirestore(result.user);
        return result.user;
    } catch (error) {
        throw error;
    }
}

export const loginWithEmail = async (email: string, pass: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        await syncUserToFirestore(result.user);
        return result.user;
    } catch (error) {
        throw error;
    }
}

export const logout = () => signOut(auth);

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// --- DATABASE SEEDING (Run Once) ---

export const seedDatabase = async () => {
  const batchLimit = 500; 
  let batch = writeBatch(db);
  let operationCount = 0;

  console.log("Starting database seeding/restoration...");

  // 1. Seed Categories
  const catSnapshot = await getDocs(categoriesRef);
  if (catSnapshot.empty) {
    console.log("Seeding categories...");
    for (const cat of DEFAULT_CATEGORY_DEFINITIONS) {
      const docRef = doc(db, 'categories', cat.id);
      batch.set(docRef, cat);
      operationCount++;
    }
  } else {
    console.log("Categories exist. Skipping category re-seed.");
  }

  // 2. Seed Services (Restoring Defaults)
  console.log("Restoring default services...");
  for (const service of MOCK_SERVICES) {
      const { id, ...data } = service;
      // Use setDoc with the deterministic ID to overwrite/restore
      const docRef = doc(db, 'services', id); 
      // Initialize views for seeded data
      batch.set(docRef, { ...data, views: Math.floor(Math.random() * 500) });
      operationCount++;

      if (operationCount >= batchLimit) {
          await batch.commit();
          batch = writeBatch(db);
          operationCount = 0;
      }
  }

  if (operationCount > 0) {
      await batch.commit();
  }
  
  console.log("Database seeding/restoration complete.");
};

// --- Analytics ---

export const incrementViewCount = async (collectionName: 'services' | 'blogs', id: string) => {
  try {
    const ref = doc(db, collectionName, id);
    await updateDoc(ref, { views: increment(1) });
  } catch (e) {
    console.warn("Failed to increment view", e);
  }
}

// --- Service Management (Real Firestore) ---

export const addService = async (serviceData: Omit<ServiceEntry, 'id' | 'status' | 'submittedAt' | 'likes' | 'views'>) => {
  try {
    const docRef = await addDoc(servicesRef, {
      ...serviceData,
      status: ServiceStatus.PENDING,
      submittedAt: Date.now(),
      likes: 0,
      views: 0
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding service: ", e);
    throw e;
  }
};

export const updateServiceData = async (id: string, data: Partial<ServiceEntry>) => {
    try {
        const sRef = doc(db, 'services', id);
        // When a user edits, reset status to PENDING for re-review
        await updateDoc(sRef, { ...data, status: ServiceStatus.PENDING }); 
    } catch (e) {
        console.error("Error updating service: ", e);
        throw e;
    }
};

export const getServiceById = async (id: string): Promise<ServiceEntry | null> => {
    try {
        const d = await getDoc(doc(db, 'services', id));
        if (d.exists()) return { id: d.id, ...d.data() } as ServiceEntry;
        return null;
    } catch (e) {
        console.error("Error getting service: ", e);
        return null;
    }
}

export const fetchServices = async (status: ServiceStatus = ServiceStatus.APPROVED): Promise<ServiceEntry[]> => {
  try {
    const q = query(servicesRef, where("status", "==", status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceEntry));
  } catch (e) {
    console.error("Error fetching services: ", e);
    return [];
  }
};

export const fetchPopularServices = async (): Promise<ServiceEntry[]> => {
  try {
    // Note: In production, you'd use orderBy('views', 'desc'), limit(4)
    // But that requires a specific index. To prevent errors for now, we sort client-side.
    const q = query(servicesRef, where("status", "==", ServiceStatus.APPROVED));
    const querySnapshot = await getDocs(q);
    const all = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceEntry));
    return all.sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 4);
  } catch (e) {
    console.error("Error fetching popular services", e);
    return [];
  }
}

export const fetchUserServices = async (uid: string): Promise<ServiceEntry[]> => {
    try {
        const q = query(servicesRef, where("submittedBy", "==", uid));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceEntry));
    } catch (e) {
        console.error("Error fetching user services: ", e);
        return [];
    }
}

export const updateServiceStatus = async (id: string, status: ServiceStatus) => {
    try {
        const sRef = doc(db, 'services', id);
        await updateDoc(sRef, { status });
    } catch (e) {
        console.error("Error updating status: ", e);
        throw e;
    }
}

export const deleteService = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'services', id));
    } catch (e) {
        console.error("Error deleting service: ", e);
        throw e;
    }
}

// --- Report Management (Admin) ---

export const submitReport = async (reportData: Omit<ReportDocument, 'id'>) => {
  try {
    await addDoc(reportsRef, reportData);
  } catch (e) {
    console.error("Error submitting report: ", e);
    throw e;
  }
}

export const fetchReports = async (): Promise<ReportDocument[]> => {
  try {
    // Client-side sort for consistency and to avoid index errors
    const q = query(reportsRef);
    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReportDocument));
    return reports.sort((a,b) => b.reportedAt - a.reportedAt);
  } catch (e) {
    console.error("Error fetching reports: ", e);
    return [];
  }
}

export const deleteReport = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'reports', id));
  } catch (e) {
    console.error("Error deleting report: ", e);
    throw e;
  }
}

// --- Notification Management ---

export const sendNotification = async (notif: Omit<NotificationDocument, 'id'>) => {
  try {
    await addDoc(notificationsRef, notif);
  } catch (e) {
    console.error("Error sending notification", e);
    throw e;
  }
}

export const fetchNotifications = async (uid: string): Promise<NotificationDocument[]> => {
  try {
    const q = query(notificationsRef, where('userId', 'in', [uid, 'ALL']));
    const snap = await getDocs(q);
    const notifications = snap.docs.map(d => ({id: d.id, ...d.data()} as NotificationDocument));
    return notifications.sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    console.error("Error fetching notifications", e);
    return [];
  }
}

export const fetchAllNotifications = async (): Promise<NotificationDocument[]> => {
    try {
        const q = query(notificationsRef);
        const snap = await getDocs(q);
        const notifications = snap.docs.map(d => ({id: d.id, ...d.data()} as NotificationDocument));
        return notifications.sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {
        console.error("Error fetching all notifications", e);
        return [];
    }
}

export const markNotificationRead = async (id: string) => {
    try {
        const ref = doc(db, 'notifications', id);
        await updateDoc(ref, { isRead: true });
    } catch(e) {
        console.error(e);
    }
}

// --- User Management (Admin) ---

export const fetchAllUsers = async (): Promise<UserDocument[]> => {
    try {
        // Simple query, sort client side if needed or rely on default
        const q = query(usersRef); 
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => doc.data() as UserDocument);
        return users.sort((a,b) => b.createdAt - a.createdAt);
    } catch (e) {
        console.error("Error fetching users: ", e);
        return [];
    }
}

export const toggleUserBan = async (uid: string, currentStatus: boolean) => {
    try {
        const uRef = doc(db, 'users', uid);
        await updateDoc(uRef, { isBanned: !currentStatus });
    } catch (e) {
        console.error("Error toggling ban: ", e);
        throw e;
    }
}

// --- Category Management (Admin) ---

export const fetchCategories = async (): Promise<CategoryDefinition[]> => {
    try {
        const q = query(categoriesRef);
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
             return DEFAULT_CATEGORY_DEFINITIONS;
        }
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryDefinition));
    } catch (e) {
        console.error("Error fetching categories: ", e);
        return DEFAULT_CATEGORY_DEFINITIONS;
    }
}

export const saveCategory = async (category: CategoryDefinition) => {
    try {
        const cRef = doc(db, 'categories', category.id);
        await setDoc(cRef, category);
    } catch (e) {
        console.error("Error saving category: ", e);
        throw e;
    }
}

export const deleteCategory = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'categories', id));
    } catch (e) {
        console.error("Error deleting category: ", e);
        throw e;
    }
}

// --- Blog Management ---

export const addBlog = async (blogData: Omit<BlogDocument, 'id' | 'views'>) => {
  try {
    await addDoc(blogsRef, { ...blogData, views: 0 });
  } catch (e) {
    console.error("Error adding blog: ", e);
    throw e;
  }
}

export const fetchBlogs = async (): Promise<BlogDocument[]> => {
  try {
    const q = query(blogsRef); 
    const snap = await getDocs(q);
    const blogs = snap.docs.map(d => ({id: d.id, ...d.data()} as BlogDocument));
    return blogs.sort((a,b) => b.createdAt - a.createdAt);
  } catch (e) {
    console.error("Error fetching blogs", e);
    return [];
  }
}

export const getBlogById = async (id: string): Promise<BlogDocument | null> => {
  try {
    const docRef = doc(db, 'blogs', id);
    const snap = await getDoc(docRef);
    if(snap.exists()) return { id: snap.id, ...snap.data() } as BlogDocument;
    return null;
  } catch (e) {
    console.error("Error fetching blog", e);
    return null;
  }
}

export const deleteBlog = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'blogs', id));
  } catch(e) {
    console.error(e);
    throw e;
  }
}