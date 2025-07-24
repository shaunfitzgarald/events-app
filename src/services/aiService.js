import { db, app } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
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

export default {
  processMessage,
  saveAIGeneratedEvent
};
