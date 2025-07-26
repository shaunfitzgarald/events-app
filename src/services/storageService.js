import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { auth } from './firebase';

/**
 * Upload an image to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - The storage path (e.g., 'events/images')
 * @param {string} fileName - Optional custom file name, if not provided will use file.name
 * @param {Function} progressCallback - Optional callback for upload progress updates
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export const uploadImage = async (file, path, fileName = null, progressCallback = null) => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to upload images');
    }

    // Create a more unique filename with user ID to avoid conflicts
    const name = fileName || `${Date.now()}-${auth.currentUser.uid}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    console.log(`Creating storage reference for path: ${path}/${name}`);
    
    // Create storage reference
    const storageRef = ref(storage, `${path}/${name}`);
    
    // Log metadata for debugging
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: auth.currentUser.uid,
        uploadedAt: new Date().toISOString()
      }
    };
    
    console.log('Starting upload task with metadata:', metadata);
    
    // Start upload task with metadata
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    // Return promise that resolves with download URL when complete
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate and report progress if callback provided
          if (progressCallback) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressCallback(progress);
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
          }
        },
        (error) => {
          // Handle errors
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          // Upload completed successfully, get download URL
          try {
            console.log('Upload completed successfully, getting download URL...');
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Download URL obtained:', downloadURL);
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error initiating upload:', error);
    throw error;
  }
};

/**
 * Upload multiple images to Firebase Storage
 * @param {Array<File>} files - Array of files to upload
 * @param {string} path - The storage path (e.g., 'events/images')
 * @param {Function} progressCallback - Optional callback for combined upload progress updates
 * @returns {Promise<Array<string>>} - Array of download URLs for the uploaded files
 */
export const uploadMultipleImages = async (files, path, progressCallback = null) => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to upload multiple images');
    }
    
    console.log(`Starting upload of ${files.length} images to path: ${path}`);
    
    // Validate files
    if (!files || files.length === 0) {
      throw new Error('No files provided for upload');
    }
    
    // Ensure path is valid
    if (!path) {
      throw new Error('Storage path must be provided');
    }
    
    const uploadPromises = [];
    const totalFiles = files.length;
    
    // Create individual progress trackers
    const progressTrackers = Array(totalFiles).fill(0);
    
    // Start all uploads
    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      
      // Validate each file
      if (!file || !file.name) {
        console.error(`Invalid file at index ${i}:`, file);
        continue;
      }
      
      console.log(`Uploading file ${i+1}/${totalFiles}: ${file.name} (${file.size} bytes)`);
      
      const uploadPromise = uploadImage(
        file, 
        path, 
        null, 
        (progress) => {
          // Update this file's progress
          progressTrackers[i] = progress;
          
          // Calculate and report overall progress if callback provided
          if (progressCallback) {
            const totalProgress = progressTrackers.reduce((sum, val) => sum + val, 0) / totalFiles;
            progressCallback(totalProgress);
          }
        }
      ).catch(error => {
        console.error(`Error uploading file ${i+1}/${totalFiles}:`, error);
        // Return null instead of rejecting the whole batch
        return null;
      });
      
      uploadPromises.push(uploadPromise);
    }
    
    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    
    // Filter out any failed uploads (null values)
    const downloadURLs = results.filter(url => url !== null);
    
    console.log(`Successfully uploaded ${downloadURLs.length}/${totalFiles} images`);
    
    if (downloadURLs.length === 0 && totalFiles > 0) {
      throw new Error('All image uploads failed');
    }
    
    return downloadURLs;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};
