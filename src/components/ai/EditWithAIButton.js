import React, { useState } from 'react';
import {
  Button,
  Tooltip,
  Box
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import AIEventEditor from './AIEventEditor';

/**
 * Edit with AI Button Component
 * Simple button that opens the AI Event Editor dialog
 */
const EditWithAIButton = ({ 
  event, 
  onEventUpdated, 
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  tooltip = 'Edit this event using AI assistance'
}) => {
  const [editorOpen, setEditorOpen] = useState(false);

  const handleOpenEditor = () => {
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
  };

  const handleEventUpdated = (result) => {
    // Pass the update result to parent component
    if (onEventUpdated) {
      onEventUpdated(result);
    }
    // Close the editor
    setEditorOpen(false);
  };

  return (
    <Box>
      <Tooltip title={tooltip}>
        <span>
          <Button
            variant={variant}
            size={size}
            fullWidth={fullWidth}
            disabled={disabled}
            onClick={handleOpenEditor}
            startIcon={<AIIcon />}
            endIcon={<EditIcon />}
            sx={{
              background: variant === 'contained' ? 
                'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' : 
                undefined,
              '&:hover': {
                background: variant === 'contained' ? 
                  'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)' : 
                  undefined
              }
            }}
          >
            Edit with AI
          </Button>
        </span>
      </Tooltip>

      <AIEventEditor
        event={event}
        open={editorOpen}
        onClose={handleCloseEditor}
        onEventUpdated={handleEventUpdated}
      />
    </Box>
  );
};

export default EditWithAIButton;
