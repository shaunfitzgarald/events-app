import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Image as ImageIcon
} from '@mui/icons-material';

const DragDropImageUpload = ({ 
  onFilesSelected, 
  multiple = true, 
  accept = "image/*",
  maxFiles = 10,
  children,
  disabled = false,
  existingImagesCount = 0
}) => {
  const theme = useTheme();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set drag active to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragActive(false);
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    
    // Add visual feedback for valid drag
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragActive(false);
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      return;
    }

    // Check if we're exceeding max files
    const totalFiles = existingImagesCount + imageFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed. You're trying to add ${imageFiles.length} images but already have ${existingImagesCount}.`);
      return;
    }

    // Limit to max files if multiple is false
    const filesToProcess = multiple ? imageFiles : imageFiles.slice(0, 1);
    
    onFilesSelected(filesToProcess);
  }, [onFilesSelected, multiple, maxFiles, disabled, existingImagesCount]);

  const handleFileInputChange = useCallback((e) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Check if we're exceeding max files
      const totalFiles = existingImagesCount + files.length;
      if (totalFiles > maxFiles) {
        alert(`Maximum ${maxFiles} images allowed. You're trying to add ${files.length} images but already have ${existingImagesCount}.`);
        return;
      }
      
      onFilesSelected(files);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  }, [onFilesSelected, maxFiles, disabled, existingImagesCount]);

  const getDropZoneStyles = () => {
    const baseStyles = {
      border: `2px dashed ${theme.palette.divider}`,
      borderRadius: 2,
      padding: 4,
      textAlign: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: alpha(theme.palette.background.paper, 0.5),
      position: 'relative',
      minHeight: 120,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      opacity: disabled ? 0.6 : 1
    };

    if (isDragActive && !disabled) {
      return {
        ...baseStyles,
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        transform: 'scale(1.02)',
        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
      };
    }

    if (isDragOver && !disabled) {
      return {
        ...baseStyles,
        borderColor: theme.palette.primary.light,
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        transform: 'scale(1.01)'
      };
    }

    return baseStyles;
  };

  return (
    <Paper
      elevation={0}
      sx={getDropZoneStyles()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        id="drag-drop-file-input"
        disabled={disabled}
      />
      
      {/* Drop zone content */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2,
        pointerEvents: 'none' // Prevent interference with drag events
      }}>
        {isDragActive ? (
          <>
            <CloudUploadIcon 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} 
            />
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
              Drop your images here!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {multiple ? `Add up to ${maxFiles - existingImagesCount} more images` : 'Add 1 image'}
            </Typography>
          </>
        ) : (
          <>
            <ImageIcon 
              sx={{ 
                fontSize: 40, 
                color: 'text.secondary',
                transition: 'color 0.3s ease'
              }} 
            />
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 500 }}>
              Drag & Drop Images Here
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              or click to browse files
            </Typography>
            <Button
              variant="outlined"
              component="label"
              htmlFor="drag-drop-file-input"
              startIcon={<AddPhotoAlternateIcon />}
              disabled={disabled}
              sx={{ 
                pointerEvents: 'auto',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              {existingImagesCount > 0 ? 'Add More Images' : 'Choose Images'}
            </Button>
            {multiple && (
              <Typography variant="caption" color="text.secondary">
                Maximum {maxFiles} images • JPG, PNG, GIF supported
              </Typography>
            )}
          </>
        )}
      </Box>

      {/* Custom children content */}
      {children}

      {/* Pulse animation for drag active state */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </Paper>
  );
};

export default DragDropImageUpload;
