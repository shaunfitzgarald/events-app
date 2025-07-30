import { db, auth, storage } from '../services/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Register a new user with enhanced profile information
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} The created user
 */
export const registerUser = async (userData) => {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    const user = userCredential.user;
    
    // Upload profile picture if provided
    let profilePictureUrl = null;
    if (userData.profilePicture) {
      profilePictureUrl = await uploadProfilePicture(user.uid, userData.profilePicture);
      
      // Update the user profile with the picture URL
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`,
        photoURL: profilePictureUrl
      });
    } else {
      // Just update the display name
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });
    }
    
    // Create enhanced user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone || null,
      addressLine1: userData.addressLine1 || null,
      addressLine2: userData.addressLine2 || null,
      city: userData.city || null,
      state: userData.state || null,
      country: userData.country || null,
      zip: userData.zip || null,
      profilePicture: profilePictureUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Store payment info separately for better security
    if (userData.paymentInfo) {
      // In a production app, you would use a secure payment processor
      // and only store tokenized information, not actual credit card details
      const paymentInfo = {
        cardType: userData.paymentInfo.cardType,
        lastFour: userData.paymentInfo.cardNumber.slice(-4),
        expiryMonth: userData.paymentInfo.expiryMonth,
        expiryYear: userData.paymentInfo.expiryYear,
        billingAddressSameAsProfile: userData.paymentInfo.billingAddressSameAsProfile
      };
      
      // Add billing address if different from profile address
      if (!userData.paymentInfo.billingAddressSameAsProfile) {
        paymentInfo.billingAddress = {
          addressLine1: userData.paymentInfo.billingAddress.addressLine1,
          addressLine2: userData.paymentInfo.billingAddress.addressLine2,
          city: userData.paymentInfo.billingAddress.city,
          state: userData.paymentInfo.billingAddress.state,
          country: userData.paymentInfo.billingAddress.country,
          zip: userData.paymentInfo.billingAddress.zip
        };
      }
      
      userProfile.paymentInfo = paymentInfo;
    }
    
    // Save to Firestore
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      ...userProfile
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Upload a profile picture for a user
 * @param {string} userId - The user ID
 * @param {File} file - The profile picture file
 * @returns {Promise<string>} The download URL of the uploaded picture
 */
export const uploadProfilePicture = async (userId, file) => {
  try {
    // Create a storage reference
    const storageRef = ref(storage, `profile_pictures/${userId}/${Date.now()}_${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Get a user's profile
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} The user profile or null if not found
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Update a user's profile
 * @param {string} userId - The user ID
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<Object>} The updated user profile
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Upload new profile picture if provided
    if (profileData.profilePicture && profileData.profilePicture instanceof File) {
      profileData.profilePicture = await uploadProfilePicture(userId, profileData.profilePicture);
      
      // Update the user profile in Firebase Auth
      await updateProfile(auth.currentUser, {
        photoURL: profileData.profilePicture
      });
    }
    
    // Update display name if first or last name changed
    if (profileData.firstName || profileData.lastName) {
      const currentProfile = await getUserProfile(userId);
      const firstName = profileData.firstName || currentProfile.firstName;
      const lastName = profileData.lastName || currentProfile.lastName;
      
      await updateProfile(auth.currentUser, {
        displayName: `${firstName} ${lastName}`
      });
    }
    
    // Update email if changed
    if (profileData.email && profileData.email !== auth.currentUser.email) {
      await updateEmail(auth.currentUser, profileData.email);
    }
    
    // Update password if provided
    if (profileData.password) {
      await updatePassword(auth.currentUser, profileData.password);
      delete profileData.password; // Don't store password in Firestore
    }
    
    // Update the profile in Firestore
    const updateData = {
      ...profileData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(userRef, updateData);
    
    // Get the updated profile
    return await getUserProfile(userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update a user's payment information
 * @param {string} userId - The user ID
 * @param {Object} paymentInfo - The payment information to update
 * @returns {Promise<void>}
 */
export const updatePaymentInfo = async (userId, paymentInfo) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // In a production app, you would use a secure payment processor
    // and only store tokenized information, not actual credit card details
    const securePaymentInfo = {
      cardType: paymentInfo.cardType,
      lastFour: paymentInfo.cardNumber.slice(-4),
      expiryMonth: paymentInfo.expiryMonth,
      expiryYear: paymentInfo.expiryYear,
      billingAddressSameAsProfile: paymentInfo.billingAddressSameAsProfile
    };
    
    // Add billing address if different from profile address
    if (!paymentInfo.billingAddressSameAsProfile) {
      securePaymentInfo.billingAddress = {
        addressLine1: paymentInfo.billingAddress.addressLine1,
        addressLine2: paymentInfo.billingAddress.addressLine2,
        city: paymentInfo.billingAddress.city,
        state: paymentInfo.billingAddress.state,
        country: paymentInfo.billingAddress.country,
        zip: paymentInfo.billingAddress.zip
      };
    }
    
    await updateDoc(userRef, {
      paymentInfo: securePaymentInfo,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating payment information:', error);
    throw error;
  }
};
