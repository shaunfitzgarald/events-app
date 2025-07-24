import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Chip,
  Fade,
  useTheme,
  Alert,
  Snackbar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { processMessage, saveAIGeneratedEvent } from '../services/aiService';
import dayjs from 'dayjs';

// This will be our AI assistant page where users can describe their event
// and the AI will help fill out the details
function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hi there! I\'m your event planning assistant. Tell me about the event you want to create, and I\'ll help you set it up. You can describe it in natural language, like "I want to organize a birthday party for 20 people next Saturday at 7pm at my house."'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const streamingIntervalRef = useRef(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up streaming interval on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  // Simulate streaming text effect for AI responses
  const streamResponse = (fullMessage) => {
    setIsStreaming(true);
    setStreamingMessage('');
    
    let index = 0;
    const messageLength = fullMessage.length;
    const typingSpeed = 15; // milliseconds per character (adjust for faster/slower typing)
    
    // Add a temporary streaming message to the chat
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
    
    // Stream the message character by character
    streamingIntervalRef.current = setInterval(() => {
      if (index < messageLength) {
        setStreamingMessage(prev => prev + fullMessage.charAt(index));
        index++;
      } else {
        // Streaming complete
        clearInterval(streamingIntervalRef.current);
        streamingIntervalRef.current = null;
        
        // Replace the streaming message with the complete message
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            role: 'assistant', 
            content: fullMessage,
            isStreaming: false
          };
          return newMessages;
        });
        
        setIsStreaming(false);
        setStreamingMessage('');
      }
    }, typingSpeed);
  };

  // Handle sending a message to the AI assistant
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Reset any previous errors
    setError('');
    
    // If already streaming, don't allow new messages
    if (isStreaming) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Get previous messages for context (excluding the welcome message)
      const conversationHistory = messages.length > 1 ? 
        messages.slice(1).map(msg => ({ role: msg.role, content: msg.content })) : 
        [];
      
      // Process the message using our AI service
      const response = await processMessage(input, conversationHistory);
      
      // Stream the AI response instead of showing it all at once
      streamResponse(response.aiMessage);
      
      // Set the extracted event data
      setEventData(response.eventData);
      
    } catch (error) {
      console.error('Error processing message:', error);
      setError('Failed to process your request. Please try again.');
      streamResponse('Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle creating the event with the extracted data
  const handleCreateEvent = async () => {
    if (!currentUser) {
      setError('You must be logged in to create an event');
      return;
    }
    
    setLoading(true);
    try {
      // Save the AI-generated event to Firestore
      const eventId = await saveAIGeneratedEvent(eventData, currentUser.uid);
      
      // Show success message
      setSuccessMessage('Event created successfully!');
      
      // Navigate to the event detail page after a short delay
      setTimeout(() => {
        navigate(`/events/${eventId}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create the event. Please try again.');
      setLoading(false);
    }
  };
  
  // Format date and time for display
  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return '';
    try {
      return dayjs(dateStr).format('MMM D, YYYY') + (timeStr ? ` at ${timeStr}` : '');
    } catch (error) {
      return dateStr + (timeStr ? ` at ${timeStr}` : '');
    }
  };

  // Handle closing error alerts
  const handleCloseError = () => {
    setError('');
  };

  // Handle closing success alerts
  const handleCloseSuccess = () => {
    setSuccessMessage('');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        {/* Error and success notifications */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
        
        <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleCloseSuccess}>
          <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          AI Event Planning Assistant
        </Typography>
        <Typography variant="body1" paragraph align="center">
          Describe your event in natural language, and I'll help you set it up
        </Typography>

        {/* Chat interface */}
        <Paper 
          elevation={3} 
          sx={{ 
            height: '60vh', 
            mb: 2, 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: theme.palette.background.default
          }}
        >
          {/* Messages area */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
            <List>
              {messages.map((message, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ 
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                      mb: 1
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                          ml: message.role === 'user' ? 2 : 0,
                          mr: message.role === 'user' ? 0 : 2
                        }}
                      >
                        {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <Paper 
                      elevation={1}
                      sx={{ 
                        p: 2, 
                        maxWidth: '70%',
                        bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                        color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body1">
                        {message.isStreaming ? streamingMessage : message.content}
                      </Typography>
                      {message.isStreaming && (
                        <Box component="span" sx={{ display: 'inline-block', ml: 0.5 }}>
                          <Typography 
                            component="span" 
                            sx={{ 
                              animation: 'blink 1s infinite',
                              '@keyframes blink': {
                                '0%': { opacity: 0 },
                                '50%': { opacity: 1 },
                                '100%': { opacity: 0 }
                              }
                            }}
                          >
                            |
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </ListItem>
                  {index < messages.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </List>
          </Box>

          {/* Input area */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Describe your event..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading}
              sx={{ mr: 1 }}
            />
            <IconButton 
              color="primary" 
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </Box>
        </Paper>

        {/* Event data card (shown when AI has extracted event details) */}
        {eventData && (
          <Fade in={!!eventData}>
            <Card elevation={3} sx={{ mt: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Extracted Event Details
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip label={`Type: ${eventData.type}`} color="primary" variant="outlined" />
                  <Chip label={`Category: ${eventData.category}`} color="primary" variant="outlined" />
                  <Chip label={`Guests: ${eventData.expectedGuests}/${eventData.maxAttendees}`} color="primary" variant="outlined" />
                  {eventData.price && (
                    <Chip label={`Price: ${eventData.price}`} color="primary" variant="outlined" />
                  )}
                  {eventData.budget && (
                    <Chip label={`Budget: $${eventData.budget}`} color="primary" variant="outlined" />
                  )}
                </Box>
                
                {/* Event title and main details */}
                <Typography variant="h6">{eventData.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={eventData.organizer?.image} 
                    alt={eventData.organizer?.name || 'Organizer'}
                    sx={{ mr: 1, width: 24, height: 24 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Organized by {eventData.organizer?.name || 'Event Host'}
                  </Typography>
                </Box>
                
                {/* Date, time, location */}
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Date:</strong> {dayjs(eventData.date).format('MMM D, YYYY')}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Time:</strong> {dayjs(`2000-01-01 ${eventData.time}`).format('h:mm A')} to {dayjs(`2000-01-01 ${eventData.endTime}`).format('h:mm A')}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Location:</strong> {eventData.location}
                </Typography>
                {eventData.address && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Address:</strong> {eventData.address}
                  </Typography>
                )}
                
                {/* Description */}
                <Typography variant="body1" paragraph>
                  {eventData.description}
                </Typography>
                
                {/* Schedule */}
                {eventData.schedule && eventData.schedule.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Schedule:
                    </Typography>
                    {eventData.schedule.map((day, dayIndex) => (
                      <Box key={dayIndex} sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{day.day}</Typography>
                        {day.items.map((item, itemIndex) => (
                          <Typography key={itemIndex} variant="body2">
                            {item.time} - {item.title}
                          </Typography>
                        ))}
                      </Box>
                    ))}
                  </Box>
                )}
                
                {/* Notes */}
                {eventData.notes && (
                  <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>
                    <strong>Notes:</strong> {eventData.notes}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  You can edit these details before creating the event.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <EditIcon />} 
                  variant="contained" 
                  color="primary"
                  onClick={handleCreateEvent}
                  fullWidth
                  disabled={loading || !currentUser}
                >
                  {loading ? 'Creating Event...' : 'Create Event with These Details'}
                </Button>
              </CardActions>
            </Card>
          </Fade>
        )}
      </Box>
    </Container>
  );
}

export default AIAssistantPage;
