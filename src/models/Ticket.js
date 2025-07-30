/**
 * Ticket model for the Events App
 * Represents a ticket purchased for an event
 */
import { db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, limit } from 'firebase/firestore';

/**
 * Generate a random 16-digit ticket number
 * @returns {string} A random 16-digit number as string
 */
export const generateTicketNumber = () => {
  // Generate a random 16-digit number with improved entropy
  let ticketNumber = '';
  const timestamp = Date.now().toString().slice(-4); // Use last 4 digits of timestamp
  
  // Add timestamp digits to first 4 positions for better uniqueness
  ticketNumber += timestamp;
  
  // Add 12 more random digits
  for (let i = 0; i < 12; i++) {
    ticketNumber += Math.floor(Math.random() * 10);
  }
  return ticketNumber;
};

/**
 * Check if a ticket number already exists in the database
 * @param {string} ticketNumber - The ticket number to check
 * @returns {Promise<boolean>} True if the ticket number exists, false otherwise
 */
export const isTicketNumberTaken = async (ticketNumber) => {
  try {
    // Check both tickets and ticket_holds collections
    const ticketsRef = collection(db, 'tickets');
    const ticketQuery = query(ticketsRef, where('ticketNumber', '==', ticketNumber), limit(1));
    const ticketSnapshot = await getDocs(ticketQuery);
    
    if (!ticketSnapshot.empty) {
      return true; // Ticket number exists in tickets collection
    }
    
    // Also check ticket_holds collection for temporary holds
    const holdsRef = collection(db, 'ticket_holds');
    const holdQuery = query(holdsRef, where('ticketNumber', '==', ticketNumber), limit(1));
    const holdSnapshot = await getDocs(holdQuery);
    
    return !holdSnapshot.empty; // True if hold exists, false otherwise
  } catch (error) {
    console.error('Error checking ticket number:', error);
    // In case of error, assume it's taken to be safe
    return true;
  }
};

/**
 * Generate a unique ticket number that doesn't exist in the database
 * @returns {Promise<string>} A unique ticket number
 */
export const generateUniqueTicketNumber = async () => {
  let ticketNumber;
  let isTaken = true;
  let attempts = 0;
  const MAX_ATTEMPTS = 10; // Prevent infinite loops
  
  while (isTaken && attempts < MAX_ATTEMPTS) {
    ticketNumber = generateTicketNumber();
    isTaken = await isTicketNumberTaken(ticketNumber);
    attempts++;
  }
  
  if (attempts >= MAX_ATTEMPTS) {
    throw new Error('Failed to generate a unique ticket number after multiple attempts');
  }
  
  return ticketNumber;
};

/**
 * Place a temporary hold on a ticket number to prevent duplicate assignments
 * @param {string} ticketNumber - The ticket number to hold
 * @param {string} userId - The ID of the user placing the hold
 * @param {number} holdDurationMinutes - How long to hold the ticket number (in minutes)
 * @returns {Promise<string>} The ID of the hold document
 */
export const placeTicketNumberHold = async (ticketNumber, userId, holdDurationMinutes = 15) => {
  try {
    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + holdDurationMinutes);
    
    // Create hold document
    const holdsRef = collection(db, 'ticket_holds');
    const holdDoc = await addDoc(holdsRef, {
      ticketNumber,
      userId,
      createdAt: serverTimestamp(),
      expiresAt,
    });
    
    return holdDoc.id;
  } catch (error) {
    console.error('Error placing ticket hold:', error);
    throw error;
  }
};

/**
 * Release a ticket number hold
 * @param {string} holdId - The ID of the hold to release
 * @returns {Promise<void>}
 */
export const releaseTicketNumberHold = async (holdId) => {
  try {
    const holdRef = doc(db, 'ticket_holds', holdId);
    await deleteDoc(holdRef);
  } catch (error) {
    console.error('Error releasing ticket hold:', error);
    // Don't throw here - we want to continue even if release fails
  }
};

/**
 * Generate a random 6-character verification code
 * @returns {string} A random 6-character alphanumeric code
 */
export const generateVerificationCode = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar-looking characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
};

/**
 * Create a new ticket object
 * @param {string} eventId - The ID of the event
 * @param {string} userId - The ID of the user purchasing the ticket
 * @param {boolean} useVerificationCode - Whether to use a verification code for extra security
 * @param {number} price - The price of the ticket
 * @returns {Object} A new ticket object
 */
export const createTicket = (eventId, userId, useVerificationCode = false, price = 0) => {
  // Note: The ticket number will be overridden with a guaranteed unique one in createEventTicket
  // This is just a placeholder
  const ticketNumber = 'pending-assignment';
  const verificationCode = useVerificationCode ? generateVerificationCode() : null;
  
  return {
    ticketNumber,
    verificationCode,
    eventId,
    userId,
    price,
    purchasedAt: new Date(),
    status: 'active', // active, used, cancelled, refunded
    checkedIn: false,
    checkedInAt: null
  };
};

/**
 * Validate a ticket
 * @param {string} ticketNumber - The ticket number to validate
 * @param {string} verificationCode - The verification code (if applicable)
 * @param {Object} ticket - The ticket object from the database
 * @returns {Object} Validation result with status and message
 */
export const validateTicket = (ticketNumber, verificationCode, ticket) => {
  if (!ticket) {
    return { valid: false, message: 'Ticket not found' };
  }
  
  if (ticket.status !== 'active') {
    return { valid: false, message: `Ticket is ${ticket.status}` };
  }
  
  if (ticket.checkedIn) {
    return { valid: false, message: 'Ticket has already been used' };
  }
  
  if (ticket.verificationCode && verificationCode !== ticket.verificationCode) {
    return { valid: false, message: 'Invalid verification code' };
  }
  
  return { valid: true, message: 'Ticket is valid' };
};
