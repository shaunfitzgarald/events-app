import { db, app } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAI, getGenerativeModel } from 'firebase/ai';



// Help Center knowledge base - common questions and answers
const HELP_CENTER_KNOWLEDGE = `
EVENTS APP HELP CENTER KNOWLEDGE BASE

ACCOUNT & REGISTRATION:
Q: How do I create an account?
A: Click "Register" in the top navigation, fill out the form with your personal information, and click "Register". You can sign up with email or phone number.

Q: I forgot my password, how do I reset it?
A: Click "Login" then "Forgot Password". Enter your email address and we'll send you a password reset link.

Q: Can I change my email address?
A: Yes, go to your Profile page and click "Update Email" in the Authentication Methods section.

Q: What is the "Only attend free events" option?
A: This is a preference you can set during registration or in your profile. When enabled, you won't need to provide payment information and can only register for free events.

EVENT CREATION & MANAGEMENT:
Q: How do I create an event?
A: Click "Create Event" in the navigation menu, fill out the event details including title, description, date, location, and other settings, then click "Create Event".

Q: Can I edit my event after creating it?
A: Yes, go to the event details page and click "Edit Event" if you're the organizer. You can modify most details including images, description, and settings.

Q: How do I delete an event?
A: On the event details page, click "Delete Event" if you're the organizer. This action cannot be undone.

Q: Can I add other people as event admins?
A: Yes, on the event details page, use the "Event Admins" section to add other users as collaborators who can help manage your event.

TICKETS & PAYMENTS:
Q: How do I enable ticket sales for my event?
A: When creating or editing an event, toggle "Enable Ticket Sales", set the ticket price and maximum quantity.

Q: How do I buy tickets for an event?
A: On the event details page, click "Buy Ticket", fill out the payment information, and complete the purchase.

Q: What if I need a refund?
A: Refund policies are set by individual event organizers. Contact the event organizer directly or use our Contact Us page.

Q: Are my payment details secure?
A: Yes, we use industry-standard encryption and security measures to protect your payment information.

AI ASSISTANT:
Q: How does the AI event assistant work?
A: Our AI assistant can help you create events by extracting details from natural language descriptions. Just describe your event and the AI will suggest structured event details.

Q: Can the AI assistant upload images?
A: Yes, you can upload multiple images when using the AI assistant, and it will include them in your event creation.

TECHNICAL ISSUES:
Q: The app is not loading properly, what should I do?
A: Try refreshing the page, clearing your browser cache, or using a different browser. If issues persist, contact our support team.

Q: I'm not receiving email notifications, why?
A: Check your spam folder and ensure your email address is correct in your profile. You can update it in the Profile page.

Q: Can I use the app on mobile devices?
A: Yes, our app is responsive and works on mobile devices, tablets, and desktop computers.

PRIVACY & SECURITY:
Q: How is my personal data protected?
A: Please review our Privacy Policy for detailed information about how we collect, use, and protect your personal data.

Q: Can I delete my account?
A: Yes, you can request account deletion by contacting our support team through the Contact Us page.

GENERAL:
Q: How do I contact support?
A: Use our Contact Us page to send us a message, or email us directly at support@eventsapp.com.

Q: Is there a mobile app?
A: Currently we offer a responsive web application that works great on mobile devices. A native mobile app may be available in the future.

Q: How do I report inappropriate content or behavior?
A: Contact us immediately through the Contact Us page with details about the issue.
`;

// System prompt for the help center chatbot
const HELP_CENTER_SYSTEM_PROMPT = `
You are a helpful customer support assistant for an Events App. Your role is to answer user questions about the app using the provided knowledge base.

INSTRUCTIONS:
1. Answer questions clearly and concisely based on the knowledge base provided
2. If you don't know the answer from the knowledge base, politely say so and suggest contacting support
3. Be friendly, professional, and helpful
4. Provide step-by-step instructions when appropriate
5. If a question is about a technical issue, suggest basic troubleshooting steps
6. Always stay focused on Events App related topics
7. If asked about something unrelated to the app, politely redirect to app-related topics

KNOWLEDGE BASE:
${HELP_CENTER_KNOWLEDGE}

Remember to be concise but thorough in your responses. Always maintain a helpful and professional tone.
`;

export const askHelpCenterQuestion = async (question, conversationHistory = [], onStreamChunk = null) => {
  try {
    // Initialize Firebase AI
    const ai = getAI(app);
    const model = getGenerativeModel(ai, { model: 'gemini-1.5-flash' });
    
    // Build conversation context
    let conversationContext = HELP_CENTER_SYSTEM_PROMPT + '\n\nCONVERSATION HISTORY:\n';
    
    conversationHistory.forEach((msg, index) => {
      conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    
    conversationContext += `\nUser: ${question}\nAssistant:`;
    
    // If streaming callback is provided, use streaming
    if (onStreamChunk) {
      const result = await model.generateContentStream(conversationContext);
      let fullResponse = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        onStreamChunk(chunkText);
      }
      
      // Log the complete conversation for analytics
      await logHelpCenterConversation(question, fullResponse);
      
      return {
        success: true,
        response: fullResponse,
        timestamp: new Date().toISOString()
      };
    } else {
      // Fallback to non-streaming for compatibility
      const result = await model.generateContent(conversationContext);
      const response = await result.response;
      const text = response.text();
      
      // Log the conversation for analytics
      await logHelpCenterConversation(question, text);
      
      return {
        success: true,
        response: text,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Error asking help center question:', error);
    return {
      success: false,
      error: error.message || 'Failed to get help center response',
      response: "I'm sorry, I'm having trouble answering your question right now. Please try again or contact our support team through the Contact Us page."
    };
  }
};

// Log help center conversations for analytics and improvement
const logHelpCenterConversation = async (question, response) => {
  try {
    await addDoc(collection(db, 'help_center_conversations'), {
      question,
      response,
      timestamp: serverTimestamp(),
      source: 'help_center_chatbot'
    });
  } catch (error) {
    console.error('Error logging help center conversation:', error);
    // Don't throw error - logging failure shouldn't break the main functionality
  }
};

// Get suggested questions for the help center
export const getSuggestedQuestions = () => {
  return [
    "How do I create an account?",
    "How do I create an event?",
    "How do I buy tickets for an event?",
    "What is the 'Only attend free events' option?",
    "How do I reset my password?",
    "How does the AI event assistant work?",
    "How do I edit my event after creating it?",
    "Are my payment details secure?",
    "How do I contact support?",
    "Can I use the app on mobile devices?"
  ];
};

// Format AI message for display (similar to aiService but for help center)
export const formatHelpCenterMessage = (message) => {
  if (!message) return '';
  
  // Format the message with proper line breaks and structure
  return message
    .replace(/\n\n/g, '\n')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .trim();
};
