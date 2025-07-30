import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Alert,
  CircularProgress
} from '@mui/material';
import { QrCode2, Download, Share, EventNote, LocationOn, AccessTime } from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';
import { getTicketByNumber } from '../services/ticketService';
import { getEventById } from '../services/eventService';

const TicketConfirmationPage = () => {
  const { ticketId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);
  const [event, setEvent] = useState(null);
  
  // Use ticket data from location state if available, otherwise fetch it
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let ticketData = location.state?.ticket;
        let eventData = location.state?.event;
        
        // If ticket data is not available in location state, fetch it
        if (!ticketData) {
          ticketData = await getTicketByNumber(ticketId);
          if (!ticketData) {
            setError('Ticket not found');
            setLoading(false);
            return;
          }
        }
        
        // If event data is not available in location state, fetch it
        if (!eventData && ticketData.eventId) {
          eventData = await getEventById(ticketData.eventId);
          if (!eventData) {
            setError('Event not found');
            setLoading(false);
            return;
          }
        }
        
        setTicket(ticketData);
        setEvent(eventData);
      } catch (error) {
        console.error('Error loading ticket data:', error);
        setError('Failed to load ticket information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [ticketId, location.state]);

  // Generate ticket QR code data
  const getQRCodeData = () => {
    if (!ticket) return '';
    
    // Create a data object with ticket details
    const qrData = {
      ticketNumber: ticket.ticketNumber,
      eventId: ticket.eventId,
      verificationCode: ticket.verificationCode || null
    };
    
    // Convert to JSON string
    return JSON.stringify(qrData);
  };

  // Download ticket as PDF (in a real app, you would generate a proper PDF)
  const downloadTicket = () => {
    // In a real app, you would generate a PDF ticket
    // For now, just download the QR code
    const canvas = document.getElementById('ticket-qr-code');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `ticket-${ticket.ticketNumber}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Share ticket (in a real app, you would implement proper sharing functionality)
  const shareTicket = () => {
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator.share({
        title: `Ticket for ${event?.title || 'Event'}`,
        text: `My ticket for ${event?.title || 'Event'}: ${ticket.ticketNumber}`,
        url: window.location.href
      })
      .catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback - copy link to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Ticket link copied to clipboard!'))
        .catch((error) => console.error('Error copying to clipboard:', error));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/events')}
        >
          Back to Events
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ticket Confirmation
      </Typography>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        Your ticket has been successfully purchased!
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              border: '1px dashed #ccc',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Ticket stub design */}
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 15,
                borderLeft: '2px dashed #ccc',
                zIndex: 1
              }} 
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  {event?.title || 'Event Ticket'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={7}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventNote sx={{ mr: 1, fontSize: 18 }} />
                    {event && new Date(event.date).toLocaleDateString()} at {event?.time}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1, fontSize: 18 }} />
                    {event?.location}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2">
                  Ticket #: {ticket.ticketNumber}
                </Typography>
                
                {ticket.verificationCode && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2">
                      Verification Code: {ticket.verificationCode}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      You will need this code when checking in
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Purchased on {new Date(ticket.purchasedAt).toLocaleDateString()} at {new Date(ticket.purchasedAt).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <QRCodeCanvas 
                    id="ticket-qr-code"
                    value={getQRCodeData()}
                    size={150}
                    level="H"
                    includeMargin={true}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Scan for check-in
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadTicket}
            >
              Download Ticket
            </Button>
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={shareTicket}
            >
              Share Ticket
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image={
                event?.images && Array.isArray(event.images) && event.images.length > 0
                  ? event.images[0]
                  : event?.image || 'https://source.unsplash.com/random/800x400/?event'
              }
              alt={event?.title}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Details
              </Typography>
              
              <Typography variant="body2" paragraph>
                {event?.description || 'No description available'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Important Information
              </Typography>
              
              <Typography variant="body2">
                • Please arrive at least 30 minutes before the event starts
              </Typography>
              <Typography variant="body2">
                • Bring a valid ID for verification
              </Typography>
              <Typography variant="body2">
                • This ticket is non-transferable
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3 }}
                onClick={() => navigate(`/events/${event?.id}`)}
              >
                View Event Details
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TicketConfirmationPage;
