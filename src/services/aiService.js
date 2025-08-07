import { db, app } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { getUserEvents, getEventById, updateEvent } from './eventService';
import dayjs from 'dayjs';

/**
 * Service for AI-related functionality
 * Uses Firebase AI and Cloud Functions
 */

/**
 * Process a user message and generate an AI response
 * @param {string} message - The user's message
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @returns {Promise<Object>} - The AI response and any extracted event data
 */
export const processMessage = async (message, conversationHistory = []) => {
  try {
    // This would call a Firebase Cloud Function that uses Firebase AI
    // For now, we'll simulate the response
    
    // In a real implementation, you would use:
    // const processMessageFunction = httpsCallable(functions, 'processEventDescription');
    // const result = await processMessageFunction({ message, conversationHistory });
    // return result.data;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use our advanced NLP extraction with sample-based prompting
    const response = await extractEventDetails(message);
    
    // Log conversation to Firestore for future training
    await logConversation(message, response.aiMessage);
    
    return response;
  } catch (error) {
    console.error('Error processing message:', error);
    throw new Error('Failed to process message with AI');
  }
};

/**
 * Save the event data extracted by the AI
 * @param {Object} eventData - The event data to save
 * @param {string} userId - The user's ID
 * @returns {Promise<string>} - The ID of the saved event
 */
export const saveAIGeneratedEvent = async (eventData, userId) => {
  try {
    console.log('Saving AI generated event with data:', eventData);
    console.log('User ID:', userId);
    
    // Debug logging for schedule data
    console.log('Original eventData.schedule:', eventData.schedule);
    console.log('Schedule is array?', Array.isArray(eventData.schedule));
    console.log('Schedule length:', eventData.schedule ? eventData.schedule.length : 'undefined');
    
    // Clean and prepare the event data for Firestore
    const cleanedEventData = {
      ...eventData,
      // Ensure date is a string in YYYY-MM-DD format
      date: eventData.date ? String(eventData.date) : dayjs().format('YYYY-MM-DD'),
      // Ensure numeric fields are numbers
      expectedGuests: Number(eventData.expectedGuests) || 0,
      maxAttendees: Number(eventData.maxAttendees) || 0,
      budget: eventData.budget ? Number(eventData.budget) : null,
      // Ensure we have a valid title
      title: eventData.title || 'Untitled Event',
      // Ensure we have a valid description
      description: eventData.description || 'No description provided',
      // Ensure we have a valid location
      location: eventData.location || 'TBD',
      // Ensure the organizer object exists
      organizer: eventData.organizer || { name: '', image: '' },
      // Ensure schedule is an array
      schedule: Array.isArray(eventData.schedule) ? eventData.schedule : [],
      // Ensure attendees is an array
      attendees: Array.isArray(eventData.attendees) ? eventData.attendees : []
    };
    
    console.log('Cleaned schedule data:', cleanedEventData.schedule);
    
    // Add to Firestore
    const eventRef = await addDoc(collection(db, 'events'), {
      ...cleanedEventData,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      aiGenerated: true
    });
    
    console.log('Event successfully created with ID:', eventRef.id);
    return eventRef.id;
  } catch (error) {
    console.error('Error saving AI generated event:', error);
    throw new Error(`Failed to save event: ${error.message}`);
  }
};

/**
 * Log conversation to Firestore for future training
 * @param {string} userMessage - The user's message
 * @param {string} aiResponse - The AI's response
 */
const logConversation = async (userMessage, aiResponse) => {
  try {
    await addDoc(collection(db, 'aiConversations'), {
      userMessage,
      aiResponse,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging conversation:', error);
    // Non-critical error, don't throw
  }
};

/**
 * Format the AI message for display in the UI
 * @param {Object} eventData - The extracted event data
 * @returns {string} - Formatted message for display
 */
const formatAIMessage = (eventData) => {
  // Format date and time for display
  const formattedDate = dayjs(eventData.date).format('dddd, MMMM D, YYYY');
  const formattedTime = `${eventData.time}${eventData.endTime ? ' - ' + eventData.endTime : ''}`;
  
  // Build a user-friendly message with the extracted details
  let message = `I've extracted the following event details:\n\n`;
  message += `📅 **${eventData.title}** (${eventData.type})\n`;
  message += `📆 ${formattedDate} at ${formattedTime}\n`;
  message += `📍 ${eventData.location}${eventData.address ? ' - ' + eventData.address : ''}\n\n`;
  
  // Add category if available
  if (eventData.category) {
    message += `Category: ${eventData.category}\n`;
  }
  
  // Add description
  message += `Description: ${eventData.description}\n\n`;
  
  // Add organizer if available
  if (eventData.organizer && eventData.organizer.name) {
    message += `Organized by: ${eventData.organizer.name}\n`;
  }
  
  // Add price if available
  if (eventData.price && eventData.price !== '$0') {
    message += `Price: ${eventData.price}\n`;
  }
  
  // Add guest information
  message += `Expected guests: ${eventData.expectedGuests}`;
  if (eventData.maxAttendees && eventData.maxAttendees > 0) {
    message += ` (maximum: ${eventData.maxAttendees})`;
  }
  message += '\n';
  
  // Add budget if available
  if (eventData.budget) {
    message += `Budget: $${eventData.budget}\n`;
  }
  
  // Add notes if available
  if (eventData.notes) {
    message += `\nNotes: ${eventData.notes}\n`;
  }
  
  // Add schedule if available
  if (eventData.schedule && eventData.schedule.length > 0) {
    message += '\n**Schedule:**\n';
    eventData.schedule.forEach(day => {
      message += `${day.day}:\n`;
      day.items.forEach(item => {
        message += `- ${item.time}: ${item.title}\n`;
      });
    });
  }
  
  message += '\nYou can review and edit these details before creating the event.';
  
  return message;
};

/**
 * Extract event details from a user message using Firebase AI Logic with Gemini
 * @param {string} message - The user's message
 * @returns {Promise<Object>} - The AI response and extracted event data
 */
const extractEventDetails = async (message) => {
  try {
    // Initialize the Gemini Developer API backend service
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    
    // Create a GenerativeModel instance with Gemini
    const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
    
    // Sample event format to use as a template in our prompt
    const sampleEvent = {
      "type": "party", // party, meeting, conference, dinner, etc.
      "title": "Birthday Party",
      "date": "2023-07-15", // ISO format
      "time": "18:00", // 24-hour format
      "endTime": "22:00", // 24-hour format
      "location": "123 Main St",
      "address": "123 Main St, Anytown, CA 12345",
      "image": "https://source.unsplash.com/random/1200x600/?party",
      "category": "Celebration",
      "description": "A birthday party for John",
      "organizer": {
        "name": "John Smith",
        "image": "https://source.unsplash.com/random/100x100/?person"
      },
      "price": "$0",
      "expectedGuests": 10,
      "maxAttendees": 20,
      "budget": 200,
      "notes": "Remember to bring gifts",
      "schedule": [
        {
          "day": "Day 1",
          "items": [
            { "time": "18:00", "title": "Arrival" },
            { "time": "19:00", "title": "Dinner" },
            { "time": "20:00", "title": "Cake Cutting" }
          ]
        }
      ],
      "attendees": []
    };
    
    // Create a structured prompt for the Gemini model
    const prompt = `Extract event details from the following user message. Format your response as a valid JSON object with the following fields:

${JSON.stringify(sampleEvent, null, 2)}

If any field is not mentioned in the user's message, make a reasonable guess based on the context or use null for optional fields like budget and notes. For required fields (title, type, date, time, location, description, expectedGuests), always provide a value even if you have to make an educated guess.

For the image field, generate an appropriate Unsplash URL based on the event type.
For the schedule, create appropriate time slots based on the event type and duration.
Make sure all dates are in YYYY-MM-DD format and times are in 24-hour format (HH:MM).

User message: "${message}"

Respond ONLY with the JSON object, nothing else.`;
    
    console.log('Sending prompt to Gemini:', prompt);
    
    // Call the Gemini model
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Received response from Gemini:', text);
    
    // Parse the JSON response
    let eventData;
    try {
      // Try to parse the raw JSON
      eventData = JSON.parse(text);
      console.log('Successfully parsed JSON response');
    } catch (error) {
      console.error('Error parsing Gemini response as JSON:', error);
      
      // If parsing fails, try to extract JSON from the text (in case model added extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          eventData = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed extracted JSON');
        } catch (innerError) {
          console.error('Error parsing extracted JSON:', innerError);
          // Fall back to our simulation if all parsing fails
          console.log('Falling back to simulation');
          return simulateAdvancedExtraction(message);
        }
      } else {
        // Fall back to our simulation if no JSON found
        console.log('No JSON found in response, falling back to simulation');
        return simulateAdvancedExtraction(message);
      }
    }
    
    // Format the response for the UI
    return {
      aiMessage: formatAIMessage(eventData),
      eventData: eventData
    };
  } catch (error) {
    console.error('Error using Firebase AI Logic:', error);
    
    // Fall back to our simulation if the API call fails
    console.log('API error, falling back to simulation');
    return simulateAdvancedExtraction(message);
  }
};

/**
 * Simulate advanced AI extraction for development
 * This is a more sophisticated version of our previous simulation
 * @param {string} message - The user's message
 * @returns {Object} - AI response and extracted event data
 */
const simulateAdvancedExtraction = (message) => {
  // Convert message to lowercase for easier pattern matching
  const lowerMessage = message.toLowerCase();
  const currentDate = dayjs();
  
  // Initialize event data with smart defaults
  let eventData = {
    title: '',
    type: 'Other',
    date: currentDate.format('YYYY-MM-DD'),
    time: '18:00',
    endTime: '20:00',
    location: 'TBD',
    address: '',
    image: '',
    category: '',
    description: message,
    organizer: {
      name: '',
      image: ''
    },
    price: '$0',
    expectedGuests: 10,
    maxAttendees: 0,
    budget: null,
    notes: null,
    schedule: [],
    attendees: []
  };
  
  // More sophisticated type detection
  const eventTypes = [
    { keywords: ['birthday', 'bday', 'birth day'], type: 'Birthday Party' },
    { keywords: ['wedding', 'marriage', 'ceremony'], type: 'Wedding' },
    { keywords: ['meeting', 'conference', 'sync', 'discussion', 'call'], type: 'Meeting' },
    { keywords: ['dinner', 'lunch', 'breakfast', 'brunch', 'meal'], type: 'Meal' },
    { keywords: ['party', 'celebration', 'gathering', 'get-together'], type: 'Party' },
    { keywords: ['concert', 'show', 'performance', 'gig'], type: 'Concert' },
    { keywords: ['workshop', 'seminar', 'class', 'training'], type: 'Workshop' },
    { keywords: ['trip', 'vacation', 'getaway', 'journey', 'travel'], type: 'Trip' },
    { keywords: ['festival', 'fair', 'carnival'], type: 'Festival' },
    { keywords: ['exhibition', 'expo', 'showcase'], type: 'Exhibition' }
  ];
  
  // Find the event type
  for (const eventType of eventTypes) {
    if (eventType.keywords.some(keyword => lowerMessage.includes(keyword))) {
      eventData.type = eventType.type;
      break;
    }
  }
  
  // Extract title with more context awareness
  if (lowerMessage.includes('for')) {
    const forIndex = lowerMessage.indexOf('for');
    let endIndex = lowerMessage.indexOf(' at ', forIndex);
    if (endIndex === -1) endIndex = lowerMessage.indexOf(' on ', forIndex);
    if (endIndex === -1) endIndex = lowerMessage.indexOf(' in ', forIndex);
    if (endIndex === -1) endIndex = lowerMessage.indexOf('. ', forIndex);
    if (endIndex === -1) endIndex = lowerMessage.length;
    
    let title = message.substring(forIndex + 4, endIndex).trim();
    if (title && title.length < 50) {
      eventData.title = title;
    }
  }
  
  // If no title was found or it's too short, create one from the event type and other details
  if (!eventData.title || eventData.title.length < 3) {
    // Try to extract a name if it's a birthday or similar personal event
    const nameMatch = message.match(/(?:for|of|with)\s+([A-Z][a-z]+)/);
    if (nameMatch) {
      eventData.title = `${eventData.type} for ${nameMatch[1]}`;
    } else {
      // Create a generic title based on event type
      eventData.title = eventData.type;
    }
  }
  
  // Extract date with better understanding of relative dates
  const dateKeywords = [
    { regex: /today/i, days: 0 },
    { regex: /tomorrow/i, days: 1 },
    { regex: /day after tomorrow/i, days: 2 },
    { regex: /next week/i, days: 7 },
    { regex: /next month/i, days: 30 }
  ];
  
  // Check for relative dates first
  let dateFound = false;
  for (const keyword of dateKeywords) {
    if (keyword.regex.test(lowerMessage)) {
      eventData.date = currentDate.add(keyword.days, 'day').format('YYYY-MM-DD');
      dateFound = true;
      break;
    }
  }
  
  // Check for specific day names (next Monday, etc.)
  if (!dateFound) {
    const dayMatch = lowerMessage.match(/next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i);
    if (dayMatch) {
      const dayName = dayMatch[1].toLowerCase();
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDayIndex = daysOfWeek.indexOf(dayName);
      
      if (targetDayIndex !== -1) {
        const today = currentDate.day(); // 0 is Sunday in dayjs
        const daysToAdd = (targetDayIndex + 7 - today) % 7 || 7; // If today, then next week
        eventData.date = currentDate.add(daysToAdd, 'day').format('YYYY-MM-DD');
        dateFound = true;
      }
    }
  }
  
  // Check for specific dates (July 15th, 07/15/2025, etc.)
  if (!dateFound) {
    // MM/DD/YYYY or MM-DD-YYYY
    const numericDateMatch = message.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    if (numericDateMatch) {
      const dateStr = numericDateMatch[1];
      const parsedDate = dayjs(dateStr);
      if (parsedDate.isValid()) {
        eventData.date = parsedDate.format('YYYY-MM-DD');
        dateFound = true;
      }
    }
    
    // Month Day format (July 15th, July 15, etc.)
    if (!dateFound) {
      const monthDayMatch = message.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?/i);
      if (monthDayMatch) {
        const month = monthDayMatch[1];
        const day = parseInt(monthDayMatch[2], 10);
        const year = currentDate.year();
        const dateStr = `${month} ${day}, ${year}`;
        const parsedDate = dayjs(dateStr);
        
        if (parsedDate.isValid()) {
          // If the date is in the past, assume next year
          if (parsedDate.isBefore(currentDate)) {
            eventData.date = parsedDate.add(1, 'year').format('YYYY-MM-DD');
          } else {
            eventData.date = parsedDate.format('YYYY-MM-DD');
          }
          dateFound = true;
        }
      }
    }
  }
  
  // Extract time with better formatting
  const timePatterns = [
    { regex: /at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i, group: 1 },
    { regex: /from\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i, group: 1 },
    { regex: /(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i, group: 1 },
    { regex: /at\s+(\d{1,2}(?::\d{2})?)/i, group: 1 }
  ];
  
  let timeFound = false;
  for (const pattern of timePatterns) {
    const match = message.match(pattern.regex);
    if (match) {
      const timeStr = match[pattern.group].trim();
      // Convert to 24-hour format
      const parsedTime = dayjs(`2000-01-01 ${timeStr}`);
      if (parsedTime.isValid()) {
        eventData.time = parsedTime.format('HH:mm');
        timeFound = true;
        
        // Set end time to 2 hours after start time by default
        eventData.endTime = parsedTime.add(2, 'hour').format('HH:mm');
        break;
      }
    }
  }
  
  // Check for duration or end time
  if (timeFound) {
    const durationMatch = message.match(/for\s+(\d+)\s+hours?/i);
    if (durationMatch) {
      const hours = parseInt(durationMatch[1], 10);
      const startTime = dayjs(`2000-01-01 ${eventData.time}`);
      eventData.endTime = startTime.add(hours, 'hour').format('HH:mm');
    } else {
      // Look for explicit end time
      const endTimeMatch = message.match(/(?:to|until|till)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
      if (endTimeMatch) {
        const endTimeStr = endTimeMatch[1].trim();
        const parsedEndTime = dayjs(`2000-01-01 ${endTimeStr}`);
        if (parsedEndTime.isValid()) {
          eventData.endTime = parsedEndTime.format('HH:mm');
        }
      }
    }
  }
  
  // Extract location with better context
  const locationPatterns = [
    { regex: /at\s+([^,.]+?)(?:\s+(?:on|at|from)\s+|[,.]|$)/i, group: 1 },
    { regex: /in\s+([^,.]+?)(?:\s+(?:on|at|from)\s+|[,.]|$)/i, group: 1 },
    { regex: /location\s*(?:is|at|in)?\s*:?\s*([^,.]+?)(?:\s+(?:on|at|from)\s+|[,.]|$)/i, group: 1 },
    { regex: /place\s*(?:is|at|in)?\s*:?\s*([^,.]+?)(?:\s+(?:on|at|from)\s+|[,.]|$)/i, group: 1 }
  ];
  
  for (const pattern of locationPatterns) {
    const match = message.match(pattern.regex);
    if (match) {
      let location = match[pattern.group].trim();
      // Don't include time in location
      if (!location.match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)/i) && location.length > 2) {
        eventData.location = location;
        break;
      }
    }
  }
  
  // Extract number of guests
  const guestPatterns = [
    { regex: /(\d+)\s+(?:people|guests|attendees|participants|friends|family members)/i, group: 1 },
    { regex: /(?:people|guests|attendees|participants)\s*:?\s*(\d+)/i, group: 1 },
    { regex: /(?:expecting|expect|invite|inviting)\s+(\d+)/i, group: 1 }
  ];
  
  for (const pattern of guestPatterns) {
    const match = message.match(pattern.regex);
    if (match) {
      eventData.expectedGuests = parseInt(match[pattern.group], 10);
      break;
    }
  }
  
  // Extract budget if mentioned
  const budgetMatch = message.match(/(?:budget|cost|spending)\s*(?:of|is|:)?\s*\$?(\d+)/i);
  if (budgetMatch) {
    eventData.budget = parseInt(budgetMatch[1], 10);
  }
  
  // Extract notes - anything that might be important but doesn't fit elsewhere
  const notesPatterns = [
    { regex: /(?:note|remember|don't forget|bring)\s+([^,.]+?)(?:[,.]|$)/i, group: 1 },
    { regex: /(?:important|special)\s+(?:note|requirement)s?\s*:?\s*([^,.]+?)(?:[,.]|$)/i, group: 1 }
  ];
  
  for (const pattern of notesPatterns) {
    const match = message.match(pattern.regex);
    if (match) {
      eventData.notes = match[pattern.group].trim();
      break;
    }
  }
  
  // Format the extracted data for display
  const formattedDate = dayjs(eventData.date).format('MMM D, YYYY');
  const formattedStartTime = dayjs(`2000-01-01 ${eventData.time}`).format('h:mm A');
  const formattedEndTime = dayjs(`2000-01-01 ${eventData.endTime}`).format('h:mm A');
  
  // Generate AI response message
  const aiMessage = `I've analyzed your event description and extracted the following details:
  
**Event Type:** ${eventData.type}
**Title:** ${eventData.title}
**Date:** ${formattedDate}
**Time:** ${formattedStartTime} to ${formattedEndTime}
**Location:** ${eventData.location}
**Expected Guests:** ${eventData.expectedGuests}
${eventData.budget ? `**Budget:** $${eventData.budget}\n` : ''}${eventData.notes ? `**Notes:** ${eventData.notes}\n` : ''}
Would you like to create this event? You can edit any details before finalizing.`;
  
  // Extract address if different from location
  if (!eventData.address && eventData.location !== 'TBD') {
    // Try to find a more specific address pattern
    const addressMatch = message.match(/(?:address|located at)\s+([^,.]+?(?:,\s*[^,.]+){1,3})(?:[,.]|$)/i);
    if (addressMatch) {
      eventData.address = addressMatch[1].trim();
    } else {
      // Use location as address if no specific address found
      eventData.address = `${eventData.location}, City, State, Zip`;
    }
  }
  
  // Set category based on event type
  const categoryMap = {
    'Birthday Party': 'Celebration',
    'Wedding': 'Celebration',
    'Party': 'Social',
    'Meeting': 'Business',
    'Meal': 'Food & Drink',
    'Concert': 'Entertainment',
    'Workshop': 'Education',
    'Trip': 'Travel',
    'Festival': 'Entertainment',
    'Exhibition': 'Arts & Culture',
    'Other': 'Miscellaneous'
  };
  eventData.category = categoryMap[eventData.type] || 'Miscellaneous';
  
  // Generate appropriate image URL based on event type
  eventData.image = `https://source.unsplash.com/random/1200x600/?${eventData.type.toLowerCase().replace(/ /g, ',')}`;
  
  // Set organizer details
  // Try to extract organizer name from message
  const organizerMatch = message.match(/(?:organized by|host(?:ed)? by|organizer is)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i);
  if (organizerMatch) {
    eventData.organizer.name = organizerMatch[1].trim();
  } else {
    eventData.organizer.name = 'Event Host';
  }
  eventData.organizer.image = `https://source.unsplash.com/random/100x100/?person`;
  
  // Extract price if mentioned
  const priceMatch = message.match(/(?:price|cost|fee)\s*(?:is|:)?\s*\$?(\d+)/i);
  if (priceMatch) {
    eventData.price = `$${priceMatch[1]}`;
  } else if (lowerMessage.includes('free')) {
    eventData.price = 'Free';
  }
  
  // Set max attendees based on expected guests
  eventData.maxAttendees = Math.max(eventData.expectedGuests * 1.5, 20);
  
  // Create a basic schedule based on event type and time
  const startTime = dayjs(`2000-01-01 ${eventData.time}`);
  const endTime = dayjs(`2000-01-01 ${eventData.endTime}`);
  const duration = endTime.diff(startTime, 'hour');
  
  // Create schedule items based on event type and duration
  const scheduleItems = [];
  
  if (eventData.type === 'Birthday Party') {
    scheduleItems.push(
      { time: startTime.format('h:mm A'), title: 'Arrival & Welcome' },
      { time: startTime.add(1, 'hour').format('h:mm A'), title: 'Food & Drinks' },
      { time: startTime.add(2, 'hour').format('h:mm A'), title: 'Cake Cutting' }
    );
  } else if (eventData.type === 'Meeting') {
    scheduleItems.push(
      { time: startTime.format('h:mm A'), title: 'Meeting Start' },
      { time: startTime.add(Math.floor(duration / 2), 'hour').format('h:mm A'), title: 'Discussion' },
      { time: endTime.format('h:mm A'), title: 'Wrap-up' }
    );
  } else if (eventData.type === 'Wedding') {
    scheduleItems.push(
      { time: startTime.format('h:mm A'), title: 'Ceremony' },
      { time: startTime.add(1, 'hour').format('h:mm A'), title: 'Reception' },
      { time: startTime.add(2, 'hour').format('h:mm A'), title: 'Dinner' },
      { time: startTime.add(3, 'hour').format('h:mm A'), title: 'Dancing' }
    );
  } else {
    // Generic schedule for other event types
    scheduleItems.push(
      { time: startTime.format('h:mm A'), title: 'Start' }
    );
    
    // Add middle item if duration is long enough
    if (duration >= 2) {
      scheduleItems.push(
        { time: startTime.add(Math.floor(duration / 2), 'hour').format('h:mm A'), title: 'Main Activity' }
      );
    }
    
    // Add end item
    scheduleItems.push(
      { time: endTime.format('h:mm A'), title: 'End' }
    );
  }
  
  // Add schedule to event data
  eventData.schedule = [
    {
      day: 'Day 1',
      items: scheduleItems
    }
  ];
  
  // Format the event data for saving
  const saveableEventData = {
    ...eventData,
    start: `${eventData.date}T${eventData.time}`,
    end: `${eventData.date}T${eventData.endTime}`,
  };
  
  return {
    aiMessage,
    eventData: saveableEventData
  };
};

// ============================================================================
// PHASE 1: EVENT RETRIEVAL & CONTEXT FOR AI EDITING
// ============================================================================

/**
 * Get events by user for AI context
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - Array of user's events
 */
export const getEventsByUser = async (userId) => {
  try {
    console.log('Fetching events for user:', userId);
    const events = await getUserEvents(userId);
    console.log(`Found ${events.length} events for user`);
    return events;
  } catch (error) {
    console.error('Error fetching user events for AI:', error);
    throw new Error(`Failed to fetch user events: ${error.message}`);
  }
};

/**
 * Find a specific event by natural language query
 * @param {string} userId - The user's ID
 * @param {string} query - Natural language query to find event
 * @returns {Promise<Object|null>} - The matching event or null
 */
export const findEventByQuery = async (userId, query) => {
  try {
    console.log('Finding event by query:', query);
    
    // Get all user events
    const userEvents = await getEventsByUser(userId);
    
    if (userEvents.length === 0) {
      console.log('No events found for user');
      return null;
    }
    
    // Prepare simplified event data for AI matching
    const eventsForMatching = userEvents.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      location: event.location,
      category: event.category,
      description: event.description?.substring(0, 100) // Truncate for efficiency
    }));
    
    // Initialize the Gemini model
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
    
    // Create prompt to find matching event
    const matchPrompt = `Find the best matching event for the user's query: "${query}"

Available events:
${JSON.stringify(eventsForMatching, null, 2)}

Return ONLY the event ID that best matches the query. If no good match exists, return "NONE".
Consider title, date, location, category, and description when matching.

Response format: Just the event ID or "NONE"`;
    
    console.log('Sending event matching prompt to Gemini');
    const result = await model.generateContent(matchPrompt);
    const response = result.response.text().trim();
    
    console.log('Gemini event matching response:', response);
    
    if (response === 'NONE') {
      console.log('No matching event found');
      return null;
    }
    
    // Find the event by ID
    const matchedEvent = userEvents.find(event => event.id === response);
    
    if (matchedEvent) {
      console.log('Found matching event:', matchedEvent.title);
      return matchedEvent;
    } else {
      console.log('Event ID returned by AI not found in user events');
      return null;
    }
    
  } catch (error) {
    console.error('Error finding event by query:', error);
    throw new Error(`Failed to find event: ${error.message}`);
  }
};

/**
 * Prepare event data for AI analysis and editing
 * @param {Object} event - The event to analyze
 * @returns {Object} - Structured event data for AI
 */
export const analyzeEventForEditing = (event) => {
  try {
    console.log('Analyzing event for editing:', event.title);
    
    // Create a structured representation of the event for AI
    const analyzedEvent = {
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      endTime: event.endTime,
      location: event.location,
      address: event.address,
      category: event.category,
      description: event.description,
      organizer: event.organizer,
      expectedGuests: event.expectedGuests,
      maxAttendees: event.maxAttendees,
      price: event.price,
      budget: event.budget,
      schedule: event.schedule || [],
      attendees: event.attendees || [],
      notes: event.notes,
      // Add metadata for AI context
      metadata: {
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        aiGenerated: event.aiGenerated || false,
        hasSchedule: event.schedule && event.schedule.length > 0,
        hasAttendees: event.attendees && event.attendees.length > 0,
        isUpcoming: dayjs(event.date).isAfter(dayjs()),
        daysUntilEvent: dayjs(event.date).diff(dayjs(), 'day')
      }
    };
    
    console.log('Event analysis complete');
    return analyzedEvent;
    
  } catch (error) {
    console.error('Error analyzing event for editing:', error);
    throw new Error(`Failed to analyze event: ${error.message}`);
  }
};

/**
 * Get event context summary for AI prompts
 * @param {Object} event - The event to summarize
 * @returns {string} - Human-readable event summary
 */
export const getEventContextSummary = (event) => {
  const analyzed = analyzeEventForEditing(event);
  
  let summary = `Event: "${analyzed.title}"\n`;
  summary += `Date: ${analyzed.date}\n`;
  summary += `Time: ${analyzed.time}${analyzed.endTime ? ` - ${analyzed.endTime}` : ''}\n`;
  summary += `Location: ${analyzed.location}\n`;
  summary += `Category: ${analyzed.category}\n`;
  summary += `Description: ${analyzed.description}\n`;
  
  if (analyzed.expectedGuests) {
    summary += `Expected Guests: ${analyzed.expectedGuests}\n`;
  }
  
  if (analyzed.schedule && analyzed.schedule.length > 0) {
    summary += `\nSchedule:\n`;
    analyzed.schedule.forEach(day => {
      summary += `${day.day}:\n`;
      if (day.items) {
        day.items.forEach(item => {
          summary += `- ${item.time}: ${item.title}\n`;
        });
      }
    });
  }
  
  return summary;
};

// ============================================================================
// PHASE 2: EDIT INTENT RECOGNITION
// ============================================================================

/**
 * Extract edit intent from user message
 * @param {string} message - User's edit request
 * @param {Object} currentEvent - The current event data
 * @returns {Promise<Object>} - Parsed edit intent
 */
export const extractEditIntent = async (message, currentEvent) => {
  try {
    console.log('Extracting edit intent from message:', message);
    
    // Initialize the Gemini model
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
    
    // Create comprehensive prompt for edit intent recognition
    const intentPrompt = `Analyze this edit request for an event and extract the specific changes requested.

Current Event:
${getEventContextSummary(currentEvent)}

User's Edit Request: "${message}"

Analyze what the user wants to change and respond with a JSON object in this exact format:
{
  "editType": "single|multiple",
  "confidence": 0.0-1.0,
  "changes": [
    {
      "field": "title|date|time|endTime|location|address|description|category|expectedGuests|maxAttendees|price|budget|schedule|organizer|notes",
      "action": "update|add|remove",
      "currentValue": "current value or null",
      "newValue": "proposed new value",
      "reasoning": "why this change was identified"
    }
  ],
  "requiresClarification": true|false,
  "clarificationNeeded": "what needs clarification or null",
  "summary": "brief summary of all requested changes"
}

Guidelines:
- For schedule changes, use field "schedule" and include the full updated schedule in newValue
- For time changes, distinguish between "time" (start time) and "endTime"
- If the request is ambiguous, set requiresClarification to true
- Be specific about what field is being changed
- Include reasoning for each identified change

Respond ONLY with the JSON object, nothing else.`;
    
    console.log('Sending edit intent prompt to Gemini');
    const result = await model.generateContent(intentPrompt);
    const response = result.response.text().trim();
    
    console.log('Gemini edit intent response:', response);
    
    // Parse the JSON response
    let editIntent;
    try {
      editIntent = JSON.parse(response);
      console.log('Successfully parsed edit intent');
    } catch (error) {
      console.error('Error parsing edit intent JSON:', error);
      
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          editIntent = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed extracted JSON');
        } catch (innerError) {
          console.error('Error parsing extracted JSON:', innerError);
          throw new Error('Failed to parse AI edit intent response');
        }
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    }
    
    // Validate the edit intent structure
    if (!editIntent.changes || !Array.isArray(editIntent.changes)) {
      throw new Error('Invalid edit intent structure: missing changes array');
    }
    
    console.log('Edit intent extracted successfully:', editIntent.summary);
    return editIntent;
    
  } catch (error) {
    console.error('Error extracting edit intent:', error);
    throw new Error(`Failed to extract edit intent: ${error.message}`);
  }
};

/**
 * Classify the type of edit request
 * @param {Object} editIntent - The extracted edit intent
 * @returns {Object} - Classification details
 */
export const classifyEditRequest = (editIntent) => {
  try {
    const { changes } = editIntent;
    
    // Categorize changes by type
    const categories = {
      basic: ['title', 'description', 'category', 'notes'],
      timing: ['date', 'time', 'endTime'],
      location: ['location', 'address'],
      capacity: ['expectedGuests', 'maxAttendees'],
      financial: ['price', 'budget'],
      schedule: ['schedule'],
      organizer: ['organizer']
    };
    
    const classification = {
      complexity: 'simple', // simple, moderate, complex
      categories: [],
      riskLevel: 'low', // low, medium, high
      requiresValidation: false,
      estimatedImpact: 'minimal' // minimal, moderate, significant
    };
    
    // Analyze each change
    changes.forEach(change => {
      // Determine category
      for (const [category, fields] of Object.entries(categories)) {
        if (fields.includes(change.field)) {
          if (!classification.categories.includes(category)) {
            classification.categories.push(category);
          }
          break;
        }
      }
      
      // Assess risk and complexity
      if (['date', 'time', 'location'].includes(change.field)) {
        classification.riskLevel = 'medium';
        classification.requiresValidation = true;
        classification.estimatedImpact = 'moderate';
      }
      
      if (change.field === 'schedule') {
        classification.complexity = 'moderate';
        classification.estimatedImpact = 'moderate';
      }
      
      if (['price', 'maxAttendees'].includes(change.field)) {
        classification.riskLevel = 'high';
        classification.requiresValidation = true;
        classification.estimatedImpact = 'significant';
      }
    });
    
    // Adjust complexity based on number of changes
    if (changes.length > 3) {
      classification.complexity = 'complex';
    } else if (changes.length > 1) {
      classification.complexity = 'moderate';
    }
    
    console.log('Edit request classified:', classification);
    return classification;
    
  } catch (error) {
    console.error('Error classifying edit request:', error);
    throw new Error(`Failed to classify edit request: ${error.message}`);
  }
};

/**
 * Handle ambiguous edit requests with clarification
 * @param {string} message - Original user message
 * @param {Object} currentEvent - Current event data
 * @param {Object} editIntent - Extracted edit intent
 * @returns {Object} - Clarification response
 */
export const handleAmbiguousRequest = (message, currentEvent, editIntent) => {
  try {
    console.log('Handling ambiguous edit request');
    
    const clarificationResponse = {
      needsClarification: true,
      originalMessage: message,
      possibleInterpretations: [],
      suggestedQuestions: [],
      aiMessage: ''
    };
    
    // Generate clarification questions based on the ambiguity
    if (editIntent.requiresClarification) {
      clarificationResponse.suggestedQuestions.push(editIntent.clarificationNeeded);
    }
    
    // Add specific clarification questions based on detected issues
    if (editIntent.changes.some(c => c.field === 'time' && !c.newValue)) {
      clarificationResponse.suggestedQuestions.push('What time would you like to change it to?');
    }
    
    if (editIntent.changes.some(c => c.field === 'date' && !c.newValue)) {
      clarificationResponse.suggestedQuestions.push('What date would you like to change it to?');
    }
    
    if (editIntent.changes.some(c => c.field === 'location' && !c.newValue)) {
      clarificationResponse.suggestedQuestions.push('What is the new location?');
    }
    
    // Generate possible interpretations
    editIntent.changes.forEach(change => {
      if (change.newValue) {
        clarificationResponse.possibleInterpretations.push({
          field: change.field,
          interpretation: `Change ${change.field} to "${change.newValue}"`,
          confidence: editIntent.confidence
        });
      }
    });
    
    // Create AI message
    clarificationResponse.aiMessage = `I understand you want to edit your "${currentEvent.title}" event, but I need some clarification:\n\n`;
    
    if (clarificationResponse.suggestedQuestions.length > 0) {
      clarificationResponse.aiMessage += clarificationResponse.suggestedQuestions.join('\n');
    }
    
    if (clarificationResponse.possibleInterpretations.length > 0) {
      clarificationResponse.aiMessage += '\n\nIs this what you meant?\n';
      clarificationResponse.possibleInterpretations.forEach(interp => {
        clarificationResponse.aiMessage += `- ${interp.interpretation}\n`;
      });
    }
    
    console.log('Clarification response generated');
    return clarificationResponse;
    
  } catch (error) {
    console.error('Error handling ambiguous request:', error);
    throw new Error(`Failed to handle ambiguous request: ${error.message}`);
  }
};

// ============================================================================
// PHASE 3: CHANGE PROPOSAL SYSTEM
// ============================================================================

/**
 * Generate specific change proposals from edit intent
 * @param {Object} editIntent - The extracted edit intent
 * @param {Object} currentEvent - The current event data
 * @returns {Promise<Object>} - Generated change proposal
 */
export const generateEditProposal = async (editIntent, currentEvent) => {
  try {
    console.log('Generating edit proposal for:', editIntent.summary);
    
    // Initialize the Gemini model
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
    
    // Classify the edit request for context
    const classification = classifyEditRequest(editIntent);
    
    // Create proposal generation prompt
    const proposalPrompt = `Generate a detailed change proposal for an event edit request.

Current Event:
${getEventContextSummary(currentEvent)}

Requested Changes:
${JSON.stringify(editIntent.changes, null, 2)}

Edit Classification:
- Complexity: ${classification.complexity}
- Risk Level: ${classification.riskLevel}
- Categories: ${classification.categories.join(', ')}
- Estimated Impact: ${classification.estimatedImpact}

Generate a comprehensive change proposal in this JSON format:
{
  "proposalId": "unique-proposal-id",
  "summary": "brief summary of all changes",
  "changes": [
    {
      "field": "field name",
      "action": "update|add|remove",
      "currentValue": "current value",
      "proposedValue": "new proposed value",
      "reasoning": "why this change makes sense",
      "impact": "what this change affects",
      "validation": {
        "isValid": true|false,
        "warnings": ["any warnings"],
        "suggestions": ["any suggestions"]
      }
    }
  ],
  "overallImpact": {
    "attendeeNotification": true|false,
    "rescheduleRequired": true|false,
    "venueChange": true|false,
    "costImplication": true|false,
    "urgency": "low|medium|high"
  },
  "recommendations": ["list of recommendations"],
  "risks": ["list of potential risks"],
  "nextSteps": ["suggested next steps"]
}

Guidelines:
- Validate each proposed change for reasonableness
- Consider impact on attendees and event logistics
- Provide helpful warnings for risky changes
- Include practical recommendations
- Generate a unique proposal ID

Respond ONLY with the JSON object, nothing else.`;
    
    console.log('Sending proposal generation prompt to Gemini');
    const result = await model.generateContent(proposalPrompt);
    const response = result.response.text().trim();
    
    console.log('Gemini proposal response:', response);
    
    // Parse the JSON response
    let proposal;
    try {
      proposal = JSON.parse(response);
      console.log('Successfully parsed change proposal');
    } catch (error) {
      console.error('Error parsing proposal JSON:', error);
      
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          proposal = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed extracted proposal JSON');
        } catch (innerError) {
          console.error('Error parsing extracted proposal JSON:', innerError);
          throw new Error('Failed to parse AI proposal response');
        }
      } else {
        throw new Error('No valid JSON found in AI proposal response');
      }
    }
    
    // Add metadata to proposal
    proposal.metadata = {
      generatedAt: new Date().toISOString(),
      originalIntent: editIntent,
      classification: classification,
      eventId: currentEvent.id,
      eventTitle: currentEvent.title
    };
    
    console.log('Change proposal generated successfully:', proposal.proposalId);
    return proposal;
    
  } catch (error) {
    console.error('Error generating edit proposal:', error);
    throw new Error(`Failed to generate edit proposal: ${error.message}`);
  }
};

/**
 * Format edit proposal for user display
 * @param {Object} proposal - The generated proposal
 * @param {Object} currentEvent - The current event data
 * @returns {string} - Formatted message for display
 */
export const formatEditProposal = (proposal, currentEvent) => {
  try {
    console.log('Formatting edit proposal for display');
    
    let message = `I've analyzed your request to edit "${currentEvent.title}" and prepared the following changes:\n\n`;
    
    // Add summary
    message += `**Summary:** ${proposal.summary}\n\n`;
    
    // Add detailed changes
    message += `**Proposed Changes:**\n`;
    proposal.changes.forEach((change, index) => {
      message += `${index + 1}. **${change.field.charAt(0).toUpperCase() + change.field.slice(1)}**\n`;
      message += `   Current: ${change.currentValue || 'Not set'}\n`;
      message += `   New: ${change.proposedValue}\n`;
      message += `   Reason: ${change.reasoning}\n`;
      
      if (change.validation && change.validation.warnings.length > 0) {
        message += `   ⚠️ Warnings: ${change.validation.warnings.join(', ')}\n`;
      }
      
      message += `\n`;
    });
    
    // Add overall impact
    if (proposal.overallImpact) {
      message += `**Impact Assessment:**\n`;
      if (proposal.overallImpact.attendeeNotification) {
        message += `• Attendees should be notified of these changes\n`;
      }
      if (proposal.overallImpact.rescheduleRequired) {
        message += `• This may require rescheduling coordination\n`;
      }
      if (proposal.overallImpact.venueChange) {
        message += `• Venue change may affect logistics\n`;
      }
      if (proposal.overallImpact.costImplication) {
        message += `• These changes may affect event costs\n`;
      }
      message += `• Urgency level: ${proposal.overallImpact.urgency}\n\n`;
    }
    
    // Add recommendations
    if (proposal.recommendations && proposal.recommendations.length > 0) {
      message += `**Recommendations:**\n`;
      proposal.recommendations.forEach(rec => {
        message += `• ${rec}\n`;
      });
      message += `\n`;
    }
    
    // Add risks
    if (proposal.risks && proposal.risks.length > 0) {
      message += `**Potential Risks:**\n`;
      proposal.risks.forEach(risk => {
        message += `• ${risk}\n`;
      });
      message += `\n`;
    }
    
    message += `Would you like me to apply these changes to your event?`;
    
    console.log('Edit proposal formatted for display');
    return message;
    
  } catch (error) {
    console.error('Error formatting edit proposal:', error);
    throw new Error(`Failed to format edit proposal: ${error.message}`);
  }
};

/**
 * Apply approved changes to an event
 * @param {string} eventId - The event ID to update
 * @param {Object} proposal - The approved proposal
 * @param {string} userId - The user ID applying changes
 * @returns {Promise<Object>} - Result of the update
 */
export const applyEventChanges = async (eventId, proposal, userId) => {
  try {
    console.log('Applying changes to event:', eventId);
    
    // Get current event data
    const currentEvent = await getEventById(eventId);
    
    if (!currentEvent) {
      throw new Error('Event not found');
    }
    
    // Verify user has permission to edit this event
    if (currentEvent.createdBy !== userId) {
      throw new Error('User does not have permission to edit this event');
    }
    
    // Build update object from proposal changes
    const updateData = {
      updatedAt: serverTimestamp(),
      lastEditedBy: userId,
      aiEditHistory: currentEvent.aiEditHistory || []
    };
    
    // Apply each change from the proposal
    proposal.changes.forEach(change => {
      if (change.action === 'update' || change.action === 'add') {
        updateData[change.field] = change.proposedValue;
      } else if (change.action === 'remove') {
        updateData[change.field] = null;
      }
    });
    
    // Add this edit to the history
    updateData.aiEditHistory.push({
      proposalId: proposal.proposalId,
      timestamp: new Date().toISOString(),
      userId: userId,
      changes: proposal.changes,
      summary: proposal.summary
    });
    
    // Update the event in Firestore
    await updateEvent(eventId, updateData);
    
    console.log('Event changes applied successfully');
    
    return {
      success: true,
      eventId: eventId,
      appliedChanges: proposal.changes,
      summary: proposal.summary,
      message: `Successfully updated "${currentEvent.title}" with ${proposal.changes.length} change(s).`
    };
    
  } catch (error) {
    console.error('Error applying event changes:', error);
    throw new Error(`Failed to apply changes: ${error.message}`);
  }
};

/**
 * Generate before/after preview of changes
 * @param {Object} currentEvent - Current event data
 * @param {Object} proposal - The proposed changes
 * @returns {Object} - Before and after comparison
 */
export const generateChangePreview = (currentEvent, proposal) => {
  try {
    console.log('Generating change preview');
    
    const preview = {
      before: {},
      after: {},
      changedFields: []
    };
    
    // Extract changed fields from proposal
    proposal.changes.forEach(change => {
      const field = change.field;
      preview.before[field] = change.currentValue;
      preview.after[field] = change.proposedValue;
      preview.changedFields.push(field);
    });
    
    // Add unchanged important fields for context
    const contextFields = ['title', 'date', 'time', 'location', 'description'];
    contextFields.forEach(field => {
      if (!preview.changedFields.includes(field)) {
        preview.before[field] = currentEvent[field];
        preview.after[field] = currentEvent[field];
      }
    });
    
    console.log('Change preview generated');
    return preview;
    
  } catch (error) {
    console.error('Error generating change preview:', error);
    throw new Error(`Failed to generate change preview: ${error.message}`);
  }
};

export default {
  processMessage,
  saveAIGeneratedEvent,
  // Phase 1: Event retrieval & context
  getEventsByUser,
  findEventByQuery,
  analyzeEventForEditing,
  getEventContextSummary,
  // Phase 2: Edit intent recognition
  extractEditIntent,
  classifyEditRequest,
  handleAmbiguousRequest,
  // Phase 3: Change proposal system
  generateEditProposal,
  formatEditProposal,
  applyEventChanges,
  generateChangePreview
};
