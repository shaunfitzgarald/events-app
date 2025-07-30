import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  IconButton,
  GlobalStyles
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  ExpandMore,
  HelpOutline,
  Search,
  QuestionAnswer,
  Support
} from '@mui/icons-material';
import { askHelpCenterQuestion, getSuggestedQuestions, formatHelpCenterMessage } from '../services/helpCenterService';

const HelpCenterPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading || isStreaming) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');

    // Add a placeholder message for the streaming response
    const assistantMessageId = Date.now() + 1;
    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      await askHelpCenterQuestion(
        inputMessage, 
        conversationHistory,
        (chunk) => {
          // Update the streaming message
          setStreamingMessage(prev => prev + chunk);
          
          // Update the message in the messages array
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }
      );
      
      // Mark streaming as complete
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      // Replace the streaming message with an error message
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === assistantMessageId 
            ? {
                ...msg,
                content: "I'm sorry, I'm having trouble right now. Please try again or contact our support team.",
                isStreaming: false
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    setShowChat(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const faqData = [
    {
      question: "How do I create an account?",
      answer: "Click 'Register' in the top navigation, fill out the form with your personal information, and click 'Register'. You can sign up with email or phone number."
    },
    {
      question: "How do I create an event?",
      answer: "Click 'Create Event' in the navigation menu, fill out the event details including title, description, date, location, and other settings, then click 'Create Event'."
    },
    {
      question: "How do I buy tickets for an event?",
      answer: "On the event details page, click 'Buy Ticket', fill out the payment information, and complete the purchase."
    },
    {
      question: "What is the 'Only attend free events' option?",
      answer: "This is a preference you can set during registration or in your profile. When enabled, you won't need to provide payment information and can only register for free events."
    },
    {
      question: "How does the AI event assistant work?",
      answer: "Our AI assistant can help you create events by extracting details from natural language descriptions. Just describe your event and the AI will suggest structured event details."
    },
    {
      question: "Can I edit my event after creating it?",
      answer: "Yes, go to the event details page and click 'Edit Event' if you're the organizer. You can modify most details including images, description, and settings."
    },
    {
      question: "Are my payment details secure?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your payment information."
    },
    {
      question: "How do I reset my password?",
      answer: "Click 'Login' then 'Forgot Password'. Enter your email address and we'll send you a password reset link."
    }
  ];

  return (
    <>
      <GlobalStyles
        styles={{
          '@keyframes blink': {
            '0%, 50%': { opacity: 1 },
            '51%, 100%': { opacity: 0 }
          }
        }}
      />
      <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Help Center
        </Typography>
        
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Find answers to common questions or chat with our AI assistant
        </Typography>

        <Grid container spacing={4}>
          {/* FAQ Section */}
          <Grid item xs={12} md={showChat ? 6 : 12}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <HelpOutline sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">
                  Frequently Asked Questions
                </Typography>
              </Box>

              {faqData.map((faq, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>

            {/* Quick Actions */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Support sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">
                  Need More Help?
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<QuestionAnswer />}
                    onClick={() => setShowChat(true)}
                    sx={{ py: 1.5 }}
                  >
                    Ask AI Assistant
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Send />}
                    href="/contact"
                    sx={{ py: 1.5 }}
                  >
                    Contact Support
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* AI Chat Section */}
          {showChat && (
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '600px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SmartToy sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h5">
                    AI Help Assistant
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Suggested Questions */}
                {messages.length === 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Try asking:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {getSuggestedQuestions().slice(0, 4).map((question, index) => (
                        <Chip
                          key={index}
                          label={question}
                          variant="outlined"
                          size="small"
                          onClick={() => handleSuggestedQuestion(question)}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Messages */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, maxHeight: '400px' }}>
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        mb: 2,
                        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '80%' }}>
                        {message.role === 'assistant' && (
                          <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 32, height: 32 }}>
                            <SmartToy fontSize="small" />
                          </Avatar>
                        )}
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100',
                            color: message.role === 'user' ? 'white' : 'text.primary',
                            position: 'relative'
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            dangerouslySetInnerHTML={{ 
                              __html: formatHelpCenterMessage(message.content) 
                            }}
                          />
                          {message.isStreaming && (
                            <Box 
                              component="span" 
                              sx={{ 
                                display: 'inline-block',
                                width: '8px',
                                height: '16px',
                                bgcolor: 'text.primary',
                                ml: 0.5,
                                animation: 'blink 1s infinite'
                              }}
                            />
                          )}
                        </Paper>
                        {message.role === 'user' && (
                          <Avatar sx={{ ml: 1, bgcolor: 'secondary.main', width: 32, height: 32 }}>
                            <Person fontSize="small" />
                          </Avatar>
                        )}
                      </Box>
                    </Box>
                  ))}
                  {isStreaming && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 32, height: 32 }}>
                          <SmartToy fontSize="small" />
                        </Avatar>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.100' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                            <Typography variant="caption" color="text.secondary">
                              Thinking...
                            </Typography>
                          </Box>
                        </Paper>
                      </Box>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Input */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    placeholder="Ask a question about the Events App..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    size="small"
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || loading || isStreaming}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
    </>
  );
};

export default HelpCenterPage;
