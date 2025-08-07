import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Send
} from '@mui/icons-material';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Simulate form submission (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Contact Us
        </Typography>
        
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </Typography>

        <Grid container spacing={4}>
          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Get in Touch
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Email sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Email
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      support@shaunfitzgarald.com
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Phone sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Phone
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      +1 (858) 769-9688
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Address
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hillcrest<br />
                      San Diego, CA 92103<br />
                      United States
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Business Hours
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monday - Friday: 9:00 AM - 6:00 PM PST<br />
                  Saturday: 10:00 AM - 4:00 PM PST<br />
                  Sunday: Closed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom>
                Send us a Message
              </Typography>

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you for your message! We'll get back to you soon.
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Tell us how we can help you..."
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                  disabled={loading}
                  sx={{ mt: 3, px: 4 }}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ContactUsPage;
