import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  Collapse
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  findEventByQuery,
  extractEditIntent,
  generateEditProposal,
  formatEditProposal,
  applyEventChanges,
  handleAmbiguousRequest
} from '../../services/aiService';

/**
 * AI Event Editor Component
 * Provides a conversational interface for editing events with AI assistance
 */
const AIEventEditor = ({ event, open, onClose, onEventUpdated }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('input'); // input, processing, proposal, confirmation, complete
  const [editIntent, setEditIntent] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || !user) return;

    setLoading(true);
    setError(null);
    setStep('processing');

    try {
      console.log('Processing AI edit request:', message);

      // Step 1: Extract edit intent
      const intent = await extractEditIntent(message, event);
      setEditIntent(intent);

      // Step 2: Check if clarification is needed
      if (intent.requiresClarification) {
        const clarification = handleAmbiguousRequest(message, event, intent);
        setError(clarification.aiMessage);
        setStep('input');
        setLoading(false);
        return;
      }

      // Step 3: Generate proposal
      const generatedProposal = await generateEditProposal(intent, event);
      setProposal(generatedProposal);
      setStep('proposal');

    } catch (err) {
      console.error('Error processing AI edit request:', err);
      setError(`Failed to process your request: ${err.message}`);
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!proposal || !user) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Applying AI-proposed changes');
      const result = await applyEventChanges(event.id, proposal, user.uid);
      
      setStep('complete');
      
      // Notify parent component of the update
      if (onEventUpdated) {
        onEventUpdated(result);
      }

    } catch (err) {
      console.error('Error applying changes:', err);
      setError(`Failed to apply changes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setEditIntent(null);
    setProposal(null);
    setError(null);
    setStep('input');
    setShowDetails(false);
    onClose();
  };

  const renderInputStep = () => (
    <>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon color="primary" />
            Edit "{event.title}" with AI
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tell me what you'd like to change about your event. I can help with time, location, description, schedule, and more.
          </Typography>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          rows={3}
          label="What would you like to change?"
          placeholder="e.g., Change the time to 7 PM, Move the location to Central Park, Add a food truck to the schedule..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label="Change time" 
            variant="outlined" 
            size="small" 
            onClick={() => setMessage('Change the time to ')}
          />
          <Chip 
            label="Update location" 
            variant="outlined" 
            size="small" 
            onClick={() => setMessage('Change the location to ')}
          />
          <Chip 
            label="Modify description" 
            variant="outlined" 
            size="small" 
            onClick={() => setMessage('Update the description to ')}
          />
          <Chip 
            label="Add to schedule" 
            variant="outlined" 
            size="small" 
            onClick={() => setMessage('Add to the schedule: ')}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!message.trim() || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <AIIcon />}
        >
          {loading ? 'Processing...' : 'Analyze Changes'}
        </Button>
      </DialogActions>
    </>
  );

  const renderProposalStep = () => (
    <>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon color="success" />
            Proposed Changes
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            I've analyzed your request and prepared the following changes:
          </Typography>
        </Box>

        {proposal && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {proposal.summary}
              </Typography>
            </Alert>

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Changes to Apply:
            </Typography>

            {proposal.changes.map((change, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {change.field.charAt(0).toUpperCase() + change.field.slice(1)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Current:</strong> {change.currentValue || 'Not set'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>New:</strong> {change.proposedValue}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Reason:</strong> {change.reasoning}
                </Typography>
                
                {change.validation && change.validation.warnings.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      {change.validation.warnings.join(', ')}
                    </Typography>
                  </Alert>
                )}
              </Box>
            ))}

            <Box sx={{ mt: 2 }}>
              <Button
                onClick={() => setShowDetails(!showDetails)}
                startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                size="small"
              >
                {showDetails ? 'Hide' : 'Show'} Impact Details
              </Button>
              
              <Collapse in={showDetails}>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  {proposal.overallImpact && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Impact Assessment:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        {proposal.overallImpact.attendeeNotification && (
                          <Chip label="Notify Attendees" size="small" color="warning" />
                        )}
                        {proposal.overallImpact.rescheduleRequired && (
                          <Chip label="Reschedule Required" size="small" color="error" />
                        )}
                        {proposal.overallImpact.venueChange && (
                          <Chip label="Venue Change" size="small" color="info" />
                        )}
                        {proposal.overallImpact.costImplication && (
                          <Chip label="Cost Impact" size="small" color="warning" />
                        )}
                        <Chip 
                          label={`Urgency: ${proposal.overallImpact.urgency}`} 
                          size="small" 
                          color={proposal.overallImpact.urgency === 'high' ? 'error' : 'default'}
                        />
                      </Box>
                    </Box>
                  )}

                  {proposal.recommendations && proposal.recommendations.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Recommendations:
                      </Typography>
                      {proposal.recommendations.map((rec, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                          • {rec}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {proposal.risks && proposal.risks.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WarningIcon fontSize="small" color="warning" />
                        Potential Risks:
                      </Typography>
                      {proposal.risks.map((risk, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                          • {risk}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setStep('input')}>Back</Button>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleApplyChanges}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}
        >
          {loading ? 'Applying...' : 'Apply Changes'}
        </Button>
      </DialogActions>
    </>
  );

  const renderCompleteStep = () => (
    <>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Changes Applied Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Your event "{event.title}" has been updated with the AI-proposed changes.
          </Typography>
          
          {proposal && (
            <Alert severity="success" sx={{ mt: 2, textAlign: 'left' }}>
              <Typography variant="body2">
                Applied {proposal.changes.length} change(s): {proposal.summary}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          Done
        </Button>
      </DialogActions>
    </>
  );

  const renderProcessingStep = () => (
    <DialogContent>
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Analyzing Your Request
        </Typography>
        <Typography variant="body2" color="text.secondary">
          AI is processing your edit request and preparing change proposals...
        </Typography>
      </Box>
    </DialogContent>
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon />
          AI Event Editor
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {error && step !== 'input' && (
        <Alert severity="error" sx={{ mx: 3, mb: 2 }}>
          {error}
        </Alert>
      )}

      {step === 'input' && renderInputStep()}
      {step === 'processing' && renderProcessingStep()}
      {step === 'proposal' && renderProposalStep()}
      {step === 'complete' && renderCompleteStep()}
    </Dialog>
  );
};

export default AIEventEditor;
