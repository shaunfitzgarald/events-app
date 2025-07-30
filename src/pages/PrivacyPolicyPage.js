import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider
} from '@mui/material';

const PrivacyPolicyPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Privacy Policy
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
          
          <Divider sx={{ mb: 4 }} />
          
          <Typography variant="h5" gutterBottom>
            1. Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information you provide directly to us, such as when you create an account, 
            update your profile, create events, purchase tickets, or contact us. This may include:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ ml: 2, mb: 3 }}>
            <li>Personal information (name, email address, phone number)</li>
            <li>Profile information (profile picture, address, preferences)</li>
            <li>Payment information (credit card details, billing address)</li>
            <li>Event information (events you create, attend, or show interest in)</li>
            <li>Communications with us (support requests, feedback)</li>
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            2. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect to:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ ml: 2, mb: 3 }}>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments, questions, and customer service requests</li>
            <li>Communicate with you about events, features, and other news</li>
            <li>Monitor and analyze trends and usage</li>
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            3. Information Sharing and Disclosure
          </Typography>
          <Typography variant="body1" paragraph>
            We may share your information in the following situations:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ ml: 2, mb: 3 }}>
            <li>With event organizers when you register for their events</li>
            <li>With service providers who perform services on our behalf</li>
            <li>When required by law or to protect our rights</li>
            <li>In connection with a merger, acquisition, or sale of assets</li>
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            4. Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We take reasonable measures to protect your personal information from loss, theft, 
            misuse, and unauthorized access. However, no internet transmission is completely secure, 
            and we cannot guarantee absolute security.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            5. Your Rights and Choices
          </Typography>
          <Typography variant="body1" paragraph>
            You have the right to:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ ml: 2, mb: 3 }}>
            <li>Access, update, or delete your personal information</li>
            <li>Opt out of promotional communications</li>
            <li>Request a copy of your data</li>
            <li>Close your account</li>
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            6. Cookies and Tracking
          </Typography>
          <Typography variant="body1" paragraph>
            We use cookies and similar tracking technologies to collect information about your 
            browsing activities and to provide personalized content and advertisements.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            7. Children's Privacy
          </Typography>
          <Typography variant="body1" paragraph>
            Our services are not intended for children under 13. We do not knowingly collect 
            personal information from children under 13.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            8. Changes to This Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We may update this privacy policy from time to time. We will notify you of any 
            changes by posting the new policy on this page and updating the "Last updated" date.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            9. Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this privacy policy, please contact us at:
          </Typography>
          <Typography variant="body1" paragraph>
            Email: privacy@eventsapp.com<br />
            Address: 123 Event Street, San Francisco, CA 94105
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default PrivacyPolicyPage;
