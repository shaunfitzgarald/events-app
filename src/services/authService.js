import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  linkWithCredential,
  unlink,
  RecaptchaVerifier
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Collection name for user profiles
const USERS_COLLECTION = 'users';

/**
 * Create a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {Object} userData - Additional user data (name, etc.)
 * @returns {Promise<Object>} - User credentials
 */
export const registerWithEmail = async (email, password, userData = {}) => {
  try {
    // Create the user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's profile with display name if provided
    if (userData.displayName) {
      await updateProfile(user, {
        displayName: userData.displayName,
        photoURL: userData.photoURL || null
      });
    }
    
    // Create a user document in Firestore
    await createUserProfile(user.uid, {
      email,
      displayName: userData.displayName || '',
      photoURL: userData.photoURL || '',
      phoneNumber: userData.phoneNumber || '',
      createdAt: new Date(),
      ...userData
    });
    
    return userCredential;
  } catch (error) {
    console.error('Error registering with email:', error);
    throw error;
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User credentials
 */
export const loginWithEmail = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

/**
 * Initialize phone authentication with reCAPTCHA
 * @param {string} containerId - DOM element ID for reCAPTCHA container
 * @returns {Object} - RecaptchaVerifier instance
 */
export const initPhoneAuth = (containerId) => {
  try {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      'size': 'normal',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
      }
    });
    
    return window.recaptchaVerifier;
  } catch (error) {
    console.error('Error initializing phone auth:', error);
    throw error;
  }
};

/**
 * Send verification code to phone number
 * @param {string} phoneNumber - User's phone number (with country code)
 * @param {Object} recaptchaVerifier - RecaptchaVerifier instance
 * @returns {Promise<Object>} - Confirmation result
 */
export const sendVerificationCode = async (phoneNumber, recaptchaVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    // Store confirmation result to use later
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

/**
 * Verify phone number with code and sign in or link account
 * @param {string} verificationCode - Code sent to user's phone
 * @param {boolean} linkToCurrentUser - Whether to link to current user
 * @param {Object} userData - Additional user data (for new users)
 * @returns {Promise<Object>} - User credentials
 */
export const verifyPhoneNumber = async (verificationCode, linkToCurrentUser = false, userData = {}) => {
  try {
    const confirmationResult = window.confirmationResult;
    if (!confirmationResult) {
      throw new Error('No confirmation result found. Please send verification code first.');
    }
    
    const userCredential = await confirmationResult.confirm(verificationCode);
    const user = userCredential.user;
    
    if (linkToCurrentUser && auth.currentUser) {
      // Link phone credential to current user
      const credential = PhoneAuthProvider.credential(
        confirmationResult.verificationId, 
        verificationCode
      );
      await linkWithCredential(auth.currentUser, credential);
      
      // Update user profile
      await updateUserProfile(auth.currentUser.uid, {
        phoneNumber: user.phoneNumber,
        ...userData
      });
      
      return auth.currentUser;
    } else {
      // Create or update user profile for phone auth
      await createUserProfile(user.uid, {
        phoneNumber: user.phoneNumber,
        displayName: userData.displayName || '',
        photoURL: userData.photoURL || '',
        email: userData.email || '',
        createdAt: new Date(),
        ...userData
      });
      
      return userCredential;
    }
  } catch (error) {
    console.error('Error verifying phone number:', error);
    throw error;
  }
};

/**
 * Link email/password to existing phone auth account
 * @param {string} email - Email to link
 * @param {string} password - Password to set
 * @returns {Promise<Object>} - Updated user
 */
export const linkEmailToPhoneAccount = async (email, password) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user found');
    
    const credential = EmailAuthProvider.credential(email, password);
    await linkWithCredential(user, credential);
    
    // Update user profile
    await updateUserProfile(user.uid, {
      email
    });
    
    return user;
  } catch (error) {
    console.error('Error linking email to phone account:', error);
    throw error;
  }
};

/**
 * Link phone number to existing email auth account
 * @param {string} phoneNumber - Phone number to link
 * @param {Object} recaptchaVerifier - RecaptchaVerifier instance
 * @returns {Promise<Object>} - Confirmation result to be used with verifyPhoneNumber
 */
export const linkPhoneToEmailAccount = async (phoneNumber, recaptchaVerifier) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user found');
    
    return await sendVerificationCode(phoneNumber, recaptchaVerifier);
  } catch (error) {
    console.error('Error linking phone to email account:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Create a user profile document in Firestore
 * @param {string} userId - User ID
 * @param {Object} userData - User data
 * @returns {Promise<void>}
 */
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userRef, userData);
    } else {
      // Update existing user document
      await updateDoc(userRef, userData);
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Get user profile from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Update user profile in Firestore
 * @param {string} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update user email
 * @param {string} newEmail - New email address
 * @param {string} password - Current password for verification
 * @returns {Promise<void>}
 */
export const updateUserEmail = async (newEmail, password) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user found');
    
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    // Update email
    await updateEmail(user, newEmail);
    
    // Update Firestore profile
    await updateUserProfile(user.uid, {
      email: newEmail
    });
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

/**
 * Update user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
export const updateUserPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user found');
    if (!user.email) throw new Error('User does not have an email to re-authenticate');
    
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

/**
 * Get the current authenticated user
 * @returns {Object|null} - Current user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export const isAuthenticated = () => {
  return !!auth.currentUser;
};

/**
 * Set up an auth state change listener
 * @param {Function} callback - Callback function with user object
 * @returns {Function} - Unsubscribe function
 */
export const onAuthStateChanged = (callback) => {
  return auth.onAuthStateChanged(callback);
};
