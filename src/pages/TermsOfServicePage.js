import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider
} from '@mui/material';

const TermsOfServicePage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Terms of Service
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
          
          <Divider sx={{ mb: 4 }} />
          
          <Typography variant="h5" gutterBottom>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing and using our event management platform ("Service"), you accept and agree 
            to be bound by the terms and provision of this agreement. If you do not agree to abide 
            by the above, please do not use this service.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            2. Description of Service
          </Typography>
          <Typography variant="body1" paragraph>
            Our Service provides a platform for creating, managing, and attending events. Users can:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ ml: 2, mb: 3 }}>
            <li>Create and manage events</li>
            <li>Register for and attend events</li>
            <li>Purchase tickets for paid events</li>
            <li>Communicate with other attendees and organizers</li>
            <li>Access AI-powered event planning assistance</li>
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            3. User Accounts
          </Typography>
          <Typography variant="body1" paragraph>
            To use certain features of our Service, you must register for an account. You agree to:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ ml: 2, mb: 3 }}>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information</li>
            <li>Keep your password secure and confidential</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            4. Event Creation and Management
          </Typography>
          <Typography variant="body1" paragraph>
            As an event organizer, you agree to:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ ml: 2, mb: 3 }}>
            <li>Provide accurate and complete event information</li>
            <li>Honor all commitments made to attendees</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Not create events for illegal or harmful activities</li>
            <li>Handle attendee data responsibly and in compliance with privacy laws</li>
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            5. Payment and Refunds
          </Typography>
          <Typography variant="body1" paragraph>
            For paid events:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ ml: 2, mb: 3 }}>
            <li>Payment is required at the time of registration</li>
            <li>Refund policies are set by individual event organizers</li>
            <li>We may charge processing fees for transactions</li>
            <li>Chargebacks may result in account suspension</li>
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            6. Prohibited Uses
          </Typography>
          <Typography variant="body1" paragraph>
            You may not use our Service to:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ ml: 2, mb: 3 }}>
            <li>Violate any laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit harmful, offensive, or inappropriate content</li>
            <li>Spam, harass, or abuse other users</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use automated tools to access our Service</li>
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            7. Content and Intellectual Property
          </Typography>
          <Typography variant="body1" paragraph>
            You retain ownership of content you submit to our Service. However, by submitting content, 
            you grant us a worldwide, non-exclusive, royalty-free license to use, display, and 
            distribute your content in connection with our Service.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            8. Privacy
          </Typography>
          <Typography variant="body1" paragraph>
            Your privacy is important to us. Please review our Privacy Policy, which also governs 
            your use of our Service, to understand our practices.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            9. Disclaimers and Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            Our Service is provided "as is" without warranties of any kind. We are not liable for 
            any damages arising from your use of our Service, including but not limited to direct, 
            indirect, incidental, or consequential damages.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            10. Termination
          </Typography>
          <Typography variant="body1" paragraph>
            We may terminate or suspend your account and access to our Service at any time, with or 
            without cause, with or without notice. Upon termination, your right to use our Service 
            will cease immediately.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            11. Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to modify these terms at any time. We will notify users of any 
            material changes. Your continued use of our Service after changes constitutes acceptance 
            of the new terms.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            12. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms of Service, please contact us at:
          </Typography>
          <Typography variant="body1" paragraph>
            Email: legal@eventsapp.com<br />
            Address: 123 Event Street, San Francisco, CA 94105
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default TermsOfServicePage;
