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
  Snackbar,
  Badge,
  Input,
  Stack,
  LinearProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { processMessage, saveAIGeneratedEvent } from '../services/aiService';
import { uploadImage, uploadMultipleImages } from '../services/storageService';
import DragDropImageUpload from '../components/DragDropImageUpload';
import dayjs from 'dayjs';

// Draggable Image Item Component
const DraggableImageItem = ({ imageUrl, index, moveImage, removeImage }) => {
  const ref = React.useRef(null);
  
  const [, drop] = useDrop({
    accept: 'image',
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  
  const [{ isDragging }, drag] = useDrag({
    type: 'image',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  drag(drop(ref));
  
  return (
    <Paper
      ref={ref}
      sx={{
        p: 1,
        mb: 1,
        display: 'flex',
        alignItems: 'center',
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? '#f0f0f0' : 'white',
        boxShadow: isDragging ? 3 : 1,
      }}
    >
      <DragIndicatorIcon sx={{ mr: 1, cursor: 'move', color: 'text.secondary' }} />
      <Box sx={{ width: 80, height: 80, mr: 2, flexShrink: 0 }}>
        <img
          src={imageUrl}
          alt={`Event image ${index + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
        />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Image {index + 1}
          {index === 0 && (
            <Typography component="span" variant="caption" color="primary" sx={{ ml: 1 }}>
              (Main image)
            </Typography>
          )}
        </Typography>
      </Box>
      <IconButton onClick={() => removeImage(index)} color="error" size="small">
        <DeleteIcon />
      </IconButton>
    </Paper>
  );
};

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
  // Image upload states
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef(null);
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
  
  // Handle image selection
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    // Reset any previous errors
    setImageError('');
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const maxImages = 10; // Maximum number of images allowed
    
    // Check if adding these images would exceed the maximum
    if (selectedImages.length + files.length > maxImages) {
      setImageError(`You can only upload a maximum of ${maxImages} images`);
      return;
    }
    
    // Validate each file
    const validFiles = [];
    const newPreviewUrls = [];
    
    for (const file of files) {
      // Validate file type
      if (!validTypes.includes(file.type)) {
        setImageError(`File ${file.name} is not a valid image type (JPEG, PNG, GIF, WEBP)`);
        continue;
      }
      
      // Validate file size
      if (file.size > maxSize) {
        setImageError(`File ${file.name} exceeds the maximum size of 5MB`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    // If no valid files, return early
    if (validFiles.length === 0) return;
    
    // Create preview URLs for valid files
    validFiles.forEach(file => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrls(prevUrls => [...prevUrls, fileReader.result]);
      };
      fileReader.readAsDataURL(file);
    });
    
    // Update selected images
    setSelectedImages(prevImages => [...prevImages, ...validFiles]);
  };
  
  // Handle image upload
  const handleImageUpload = async () => {
    if (selectedImages.length === 0 || !currentUser) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload multiple images to Firebase Storage
      const imageUrls = await uploadMultipleImages(
        selectedImages,
        `events/images/${currentUser.uid}`,
        (progress) => setUploadProgress(progress)
      );
      
      // Update event data with image URLs
      setEventData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...imageUrls]
      }));
      
      // Reset selected images and preview URLs after successful upload
      setSelectedImages([]);
      setPreviewUrls([]);
      
      // Show success message
      setSuccessMessage(`${imageUrls.length} image${imageUrls.length > 1 ? 's' : ''} uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading images:', error);
      setImageError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  // Handle image removal for selected images (before upload)
  const handleRemoveSelectedImage = (index) => {
    setSelectedImages(prevImages => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
    
    setPreviewUrls(prevUrls => {
      const newUrls = [...prevUrls];
      newUrls.splice(index, 1);
      return newUrls;
    });
    
    // Reset current image index if needed
    if (currentImageIndex >= previewUrls.length - 1) {
      setCurrentImageIndex(Math.max(0, previewUrls.length - 2));
    }
  };
  
  // Handle image removal for uploaded images
  const handleRemoveUploadedImage = (index) => {
    if (!eventData?.images) return;
    
    setEventData(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages
      };
    });
    
    // Reset current image index if needed
    if (currentImageIndex >= (eventData?.images?.length || 0) - 1) {
      setCurrentImageIndex(Math.max(0, (eventData?.images?.length || 0) - 2));
    }
  };
  
  // Handle image reordering for selected images (before upload)
  const moveSelectedImage = (dragIndex, hoverIndex) => {
    setSelectedImages(prevImages => {
      const newImages = [...prevImages];
      const draggedImage = newImages[dragIndex];
      newImages.splice(dragIndex, 1);
      newImages.splice(hoverIndex, 0, draggedImage);
      return newImages;
    });
    
    setPreviewUrls(prevUrls => {
      const newUrls = [...prevUrls];
      const draggedUrl = newUrls[dragIndex];
      newUrls.splice(dragIndex, 1);
      newUrls.splice(hoverIndex, 0, draggedUrl);
      return newUrls;
    });
    
    // Update current image index to follow the dragged image
    if (currentImageIndex === dragIndex) {
      setCurrentImageIndex(hoverIndex);
    }
  };
  
  // Handle image reordering for uploaded images
  const moveUploadedImage = (dragIndex, hoverIndex) => {
    if (!eventData?.images) return;
    
    setEventData(prev => {
      const newImages = [...(prev.images || [])];
      const draggedImage = newImages[dragIndex];
      newImages.splice(dragIndex, 1);
      newImages.splice(hoverIndex, 0, draggedImage);
      return {
        ...prev,
        images: newImages
      };
    });
    
    // Update current image index to follow the dragged image
    if (currentImageIndex === dragIndex) {
      setCurrentImageIndex(hoverIndex);
    }
  };
  
  // Navigate through images in the preview
  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev > 0 ? prev - 1 : (eventData?.images?.length || previewUrls.length) - 1
    );
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev < (eventData?.images?.length || previewUrls.length) - 1 ? prev + 1 : 0
    );
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
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
                
                {/* Image Upload Section */}
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Event Images
                  </Typography>
                  
                  {/* Hidden file input */}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    multiple
                  />
                  
                  {/* Image gallery */}
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Image carousel/gallery */}
                    {(previewUrls.length > 0 || (eventData.images && eventData.images.length > 0)) ? (
                      <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, mb: 2 }}>
                        {/* Current image */}
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={
                              previewUrls.length > 0 
                                ? previewUrls[Math.min(currentImageIndex, previewUrls.length - 1)] 
                                : eventData.images[Math.min(currentImageIndex, eventData.images.length - 1)]
                            }
                            alt={`Event image ${currentImageIndex + 1}`}
                            style={{ width: '100%', borderRadius: '8px', height: '200px', objectFit: 'cover' }}
                          />
                          
                          {/* Navigation controls */}
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            bottom: 0, 
                            left: 0, 
                            right: 0, 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            px: 1
                          }}>
                            <IconButton 
                              onClick={handlePrevImage}
                              sx={{ bgcolor: 'rgba(0,0,0,0.3)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
                              size="small"
                            >
                              <Box component="span" sx={{ fontSize: 20 }}>&lt;</Box>
                            </IconButton>
                            
                            <IconButton 
                              onClick={handleNextImage}
                              sx={{ bgcolor: 'rgba(0,0,0,0.3)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
                              size="small"
                            >
                              <Box component="span" sx={{ fontSize: 20 }}>&gt;</Box>
                            </IconButton>
                          </Box>
                          
                          {/* Delete button */}
                          <IconButton
                            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)' }}
                            onClick={() => {
                              if (previewUrls.length > 0) {
                                handleRemoveSelectedImage(currentImageIndex);
                              } else {
                                handleRemoveUploadedImage(currentImageIndex);
                              }
                            }}
                            size="small"
                          >
                            <DeleteIcon sx={{ color: 'white' }} />
                          </IconButton>
                        </Box>
                        
                        {/* Image counter */}
                        <Typography variant="caption" align="center" display="block" sx={{ mt: 1 }}>
                          Image {currentImageIndex + 1} of {previewUrls.length || eventData.images?.length || 0}
                        </Typography>
                        
                        {/* Thumbnail strip */}
                        <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, mt: 1, pb: 1 }}>
                          {(previewUrls.length > 0 ? previewUrls : eventData.images || []).map((url, index) => (
                            <Box 
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              sx={{
                                width: 50,
                                height: 50,
                                flexShrink: 0,
                                cursor: 'pointer',
                                border: index === currentImageIndex ? '2px solid #1976d2' : '2px solid transparent',
                                borderRadius: 1,
                                overflow: 'hidden'
                              }}
                            >
                              <img 
                                src={url} 
                                alt={`Thumbnail ${index + 1}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Box>
                          ))}
                        </Box>
                        
                        {/* Drag and drop reordering */}
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Drag to reorder images. The first image will be used as the main event image.
                          </Typography>
                          
                          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                            {previewUrls.length > 0 ? (
                              // For selected images (before upload)
                              previewUrls.map((url, index) => (
                                <DraggableImageItem
                                  key={index}
                                  index={index}
                                  imageUrl={url}
                                  moveImage={moveSelectedImage}
                                  removeImage={handleRemoveSelectedImage}
                                />
                              ))
                            ) : (
                              // For uploaded images
                              (eventData.images || []).map((url, index) => (
                                <DraggableImageItem
                                  key={index}
                                  index={index}
                                  imageUrl={url}
                                  moveImage={moveUploadedImage}
                                  removeImage={handleRemoveUploadedImage}
                                />
                              ))
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <DragDropImageUpload
                        onFilesSelected={(files) => {
                          // Convert FileList to event-like object for handleImageSelect
                          const event = {
                            target: {
                              files: files
                            }
                          };
                          handleImageSelect(event);
                        }}
                        multiple={true}
                        maxFiles={10}
                        existingImagesCount={(eventData.images || []).length + previewUrls.length}
                        disabled={uploading}
                      />
                    )}
                    
                    {/* Add more images button */}
                    {(previewUrls.length > 0 || (eventData.images && eventData.images.length > 0)) && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <DragDropImageUpload
                          onFilesSelected={(files) => {
                            // Convert FileList to event-like object for handleImageSelect
                            const event = {
                              target: {
                                files: files
                              }
                            };
                            handleImageSelect(event);
                          }}
                          multiple={true}
                          maxFiles={10}
                          existingImagesCount={(eventData.images || []).length + previewUrls.length}
                          disabled={uploading}
                        />
                      </Box>
                    )}
                    
                    {/* Upload progress and buttons */}
                    {selectedImages.length > 0 && (
                      <Box sx={{ width: '100%', maxWidth: 400 }}>
                        {uploading && (
                          <Box sx={{ width: '100%', mb: 1 }}>
                            <LinearProgress variant="determinate" value={uploadProgress} />
                            <Typography variant="caption" align="center" display="block">
                              Uploading: {Math.round(uploadProgress)}%
                            </Typography>
                          </Box>
                        )}
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleImageUpload}
                          disabled={uploading}
                          fullWidth
                        >
                          {uploading ? 'Uploading...' : `Upload ${selectedImages.length} Image${selectedImages.length !== 1 ? 's' : ''}`}
                        </Button>
                      </Box>
                    )}
                    
                    {/* Image error message */}
                    {imageError && (
                      <Alert severity="error" sx={{ mt: 1, width: '100%', maxWidth: 400 }}>
                        {imageError}
                      </Alert>
                    )}
                  </Box>
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
