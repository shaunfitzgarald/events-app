import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

const EVENTS_COLLECTION = 'events';

/**
 * Add a new event to Firestore
 * @param {Object} eventData - The event data to add
 * @returns {Promise<string>} - The ID of the newly created event
 */
export const addEvent = async (eventData) => {
  try {
    // Add timestamp and format data for Firestore
    const eventWithTimestamp = {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error('Error adding event: ', error);
    throw error;
  }
};

/**
 * Get all events from Firestore
 * @returns {Promise<Array>} - Array of events
 */
export const getAllEvents = async () => {
  try {
    const eventsSnapshot = await getDocs(collection(db, EVENTS_COLLECTION));
    return eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting events: ', error);
    throw error;
  }
};

/**
 * Get events with filtering options
 * @param {Object} filters - Filter options (category, searchTerm, etc.)
 * @returns {Promise<Array>} - Array of filtered events
 */
export const getFilteredEvents = async (filters = {}) => {
  try {
    let eventsQuery = collection(db, EVENTS_COLLECTION);
    
    // Apply filters
    if (filters.category && filters.category !== 'All Categories') {
      eventsQuery = query(eventsQuery, where('category', '==', filters.category));
    }
    
    // Get documents
    const eventsSnapshot = await getDocs(eventsQuery);
    
    // Map documents to array with IDs
    let events = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Apply search term filter (client-side)
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      events = events.filter(event => 
        event.title?.toLowerCase().includes(searchTermLower) || 
        event.description?.toLowerCase().includes(searchTermLower) ||
        event.location?.toLowerCase().includes(searchTermLower)
      );
    }
    
    return events;
  } catch (error) {
    console.error('Error getting filtered events: ', error);
    throw error;
  }
};

/**
 * Get a single event by ID
 * @param {string} eventId - The ID of the event to get
 * @returns {Promise<Object>} - The event data
 */
export const getEventById = async (eventId) => {
  try {
    const eventDoc = await getDoc(doc(db, EVENTS_COLLECTION, eventId));
    
    if (eventDoc.exists()) {
      return {
        id: eventDoc.id,
        ...eventDoc.data()
      };
    } else {
      throw new Error('Event not found');
    }
  } catch (error) {
    console.error('Error getting event: ', error);
    throw error;
  }
};

/**
 * Update an existing event
 * @param {string} eventId - The ID of the event to update
 * @param {Object} eventData - The updated event data
 * @returns {Promise<void>}
 */
export const updateEvent = async (eventId, eventData) => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    
    // Add updated timestamp
    const updatedEventData = {
      ...eventData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(eventRef, updatedEventData);
  } catch (error) {
    console.error('Error updating event: ', error);
    throw error;
  }
};

/**
 * Delete an event
 * @param {string} eventId - The ID of the event to delete
 * @returns {Promise<void>}
 */
export const deleteEvent = async (eventId) => {
  try {
    await deleteDoc(doc(db, EVENTS_COLLECTION, eventId));
  } catch (error) {
    console.error('Error deleting event: ', error);
    throw error;
  }
};

/**
 * Get events created by a specific user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - Array of events created by the user
 */
export const getUserEvents = async (userId) => {
  try {
    const eventsQuery = query(
      collection(db, EVENTS_COLLECTION),
      where('createdBy', '==', userId),
      orderBy('startDate', 'desc')
    );
    
    const eventsSnapshot = await getDocs(eventsQuery);
    
    return eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user events: ', error);
    throw error;
  }
};

/**
 * Get upcoming events
 * @param {number} count - Number of events to return
 * @returns {Promise<Array>} - Array of upcoming events
 */
export const getUpcomingEvents = async (count = 5) => {
  try {
    const now = new Date();
    
    // We can't do a direct date comparison in Firestore query
    // So we'll get all events and filter client-side
    const eventsQuery = query(
      collection(db, EVENTS_COLLECTION),
      orderBy('startDate', 'asc'),
      limit(20) // Get more than we need to filter
    );
    
    const eventsSnapshot = await getDocs(eventsQuery);
    
    const events = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter for upcoming events and limit to count
    const upcomingEvents = events
      .filter(event => {
        // Handle both timestamp and date string formats
        const eventDate = event.startDate?.toDate ? 
          event.startDate.toDate() : 
          new Date(event.startDate);
        return eventDate > now;
      })
      .slice(0, count);
    
    return upcomingEvents;
  } catch (error) {
    console.error('Error getting upcoming events: ', error);
    throw error;
  }
};

/**
 * Assign an admin to an event
 * @param {string} eventId - The ID of the event
 * @param {string} userId - The ID of the user to assign as admin
 * @returns {Promise<void>}
 */
export const assignEventAdmin = async (eventId, userId) => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }
    
    const eventData = eventDoc.data();
    let admins = eventData.admins || [];
    
    // Check if user is already an admin
    if (admins.includes(userId)) {
      return; // User is already an admin, no need to update
    }
    
    // Add user to admins array
    admins.push(userId);
    
    // Update event with new admins array
    await updateDoc(eventRef, { 
      admins,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error assigning admin: ', error);
    throw error;
  }
};

/**
 * Remove an admin from an event
 * @param {string} eventId - The ID of the event
 * @param {string} userId - The ID of the user to remove as admin
 * @returns {Promise<void>}
 */
export const removeEventAdmin = async (eventId, userId) => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }
    
    const eventData = eventDoc.data();
    let admins = eventData.admins || [];
    
    // Remove user from admins array
    admins = admins.filter(adminId => adminId !== userId);
    
    // Update event with new admins array
    await updateDoc(eventRef, { 
      admins,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error removing admin: ', error);
    throw error;
  }
};
