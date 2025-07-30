import { db } from '../services/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { 
  createTicket, 
  generateVerificationCode, 
  generateUniqueTicketNumber,
  placeTicketNumberHold,
  releaseTicketNumberHold
} from '../models/Ticket';

/**
 * Create a ticket for an event
 * @param {string} eventId - The ID of the event
 * @param {string} userId - The ID of the user purchasing the ticket
 * @param {boolean} useVerificationCode - Whether to use a verification code for extra security
 * @param {number} price - The price of the ticket
 * @param {Object} paymentInfo - Payment information
 * @returns {Promise<Object>} The created ticket
 */
export const createEventTicket = async (eventId, userId, useVerificationCode = false, price = 0, paymentInfo = {}) => {
  let ticketHoldId = null;
  
  try {
    // First check if the event exists and has tickets available
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }
    
    const eventData = eventDoc.data();
    
    // Check if tickets are enabled for this event
    if (!eventData.ticketsEnabled) {
      throw new Error('Tickets are not enabled for this event');
    }
    
    // Check if tickets are available
    if (eventData.ticketsAvailable <= 0) {
      throw new Error('No tickets available for this event');
    }
    
    // Generate a unique ticket number with collision checking
    const uniqueTicketNumber = await generateUniqueTicketNumber();
    
    // Place a temporary hold on the ticket number to prevent duplicate assignments
    ticketHoldId = await placeTicketNumberHold(uniqueTicketNumber, userId);
    
    // Create the ticket with the unique number
    const ticket = createTicket(eventId, userId, useVerificationCode, price);
    
    // Override the ticket number with our guaranteed unique one
    ticket.ticketNumber = uniqueTicketNumber;
    
    // Add payment information
    ticket.paymentInfo = {
      ...paymentInfo,
      timestamp: serverTimestamp()
    };
    
    // Add the ticket to Firestore
    const ticketsRef = collection(db, 'tickets');
    const ticketDoc = await addDoc(ticketsRef, ticket);
    
    // Update the event's available tickets count
    await updateDoc(eventRef, {
      ticketsAvailable: eventData.ticketsAvailable - 1,
      ticketsSold: (eventData.ticketsSold || 0) + 1
    });
    
    // Release the hold since we've successfully created the ticket
    if (ticketHoldId) {
      await releaseTicketNumberHold(ticketHoldId);
    }
    
    return {
      id: ticketDoc.id,
      ...ticket
    };
  } catch (error) {
    // If anything fails, release the hold to prevent orphaned holds
    if (ticketHoldId) {
      await releaseTicketNumberHold(ticketHoldId).catch(err => {
        console.error('Error releasing ticket hold after failure:', err);
      });
    }
    
    console.error('Error creating ticket:', error);
    throw error;
  }
};

/**
 * Get all tickets for an event
 * @param {string} eventId - The ID of the event
 * @returns {Promise<Array>} Array of tickets
 */
export const getEventTickets = async (eventId) => {
  try {
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting event tickets:', error);
    throw error;
  }
};

/**
 * Get all tickets for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of tickets
 */
export const getUserTickets = async (userId) => {
  try {
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user tickets:', error);
    throw error;
  }
};

/**
 * Get a ticket by its ticket number
 * @param {string} ticketNumber - The ticket number
 * @returns {Promise<Object|null>} The ticket or null if not found
 */
export const getTicketByNumber = async (ticketNumber) => {
  try {
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, where('ticketNumber', '==', ticketNumber), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting ticket by number:', error);
    throw error;
  }
};

/**
 * Check in a ticket
 * @param {string} ticketId - The ID of the ticket
 * @param {string} verificationCode - The verification code (if applicable)
 * @returns {Promise<Object>} The updated ticket
 */
export const checkInTicket = async (ticketId, verificationCode = null) => {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    const ticketDoc = await getDoc(ticketRef);
    
    if (!ticketDoc.exists()) {
      throw new Error('Ticket not found');
    }
    
    const ticketData = ticketDoc.data();
    
    // Check if the ticket is already checked in
    if (ticketData.checkedIn) {
      throw new Error('Ticket has already been checked in');
    }
    
    // Check if the ticket is active
    if (ticketData.status !== 'active') {
      throw new Error(`Ticket is ${ticketData.status}`);
    }
    
    // Check the verification code if needed
    if (ticketData.verificationCode && verificationCode !== ticketData.verificationCode) {
      throw new Error('Invalid verification code');
    }
    
    // Update the ticket
    await updateDoc(ticketRef, {
      checkedIn: true,
      checkedInAt: serverTimestamp()
    });
    
    return {
      id: ticketId,
      ...ticketData,
      checkedIn: true,
      checkedInAt: new Date()
    };
  } catch (error) {
    console.error('Error checking in ticket:', error);
    throw error;
  }
};

/**
 * Cancel a ticket
 * @param {string} ticketId - The ID of the ticket
 * @returns {Promise<Object>} The updated ticket
 */
export const cancelTicket = async (ticketId) => {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    const ticketDoc = await getDoc(ticketRef);
    
    if (!ticketDoc.exists()) {
      throw new Error('Ticket not found');
    }
    
    const ticketData = ticketDoc.data();
    
    // Check if the ticket is already cancelled or refunded
    if (ticketData.status === 'cancelled' || ticketData.status === 'refunded') {
      throw new Error(`Ticket is already ${ticketData.status}`);
    }
    
    // Update the ticket
    await updateDoc(ticketRef, {
      status: 'cancelled'
    });
    
    // Update the event's available tickets count
    const eventRef = doc(db, 'events', ticketData.eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (eventDoc.exists()) {
      const eventData = eventDoc.data();
      await updateDoc(eventRef, {
        ticketsAvailable: (eventData.ticketsAvailable || 0) + 1,
        ticketsSold: Math.max(0, (eventData.ticketsSold || 0) - 1)
      });
    }
    
    return {
      id: ticketId,
      ...ticketData,
      status: 'cancelled'
    };
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    throw error;
  }
};

/**
 * Update event ticket settings
 * @param {string} eventId - The ID of the event
 * @param {Object} ticketSettings - The ticket settings to update
 * @returns {Promise<void>}
 */
export const updateEventTicketSettings = async (eventId, ticketSettings) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      ticketsEnabled: ticketSettings.enabled,
      ticketsAvailable: ticketSettings.available,
      ticketPrice: ticketSettings.price,
      ticketCurrency: ticketSettings.currency || 'USD',
      ticketVerificationRequired: ticketSettings.verificationRequired || false
    });
  } catch (error) {
    console.error('Error updating event ticket settings:', error);
    throw error;
  }
};
