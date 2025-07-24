import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShareIcon from '@mui/icons-material/Share';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function EventNavigation({ eventId, currentTab }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { eventId: paramEventId } = useParams();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Use the eventId from props or from URL params
  const id = eventId || paramEventId;
  
  // State for mobile menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  // Navigation tabs
  const tabs = [
    { label: 'Details', icon: <InfoIcon />, path: `/events/${id}` },
    { label: 'Guests', icon: <PeopleIcon />, path: `/events/${id}/guests` },
    { label: 'Budget', icon: <AttachMoneyIcon />, path: `/events/${id}/budget` },
    { label: 'Social', icon: <ShareIcon />, path: `/events/${id}/social` },
    { label: 'Schedule', icon: <ScheduleIcon />, path: `/events/${id}/schedule` },
    { label: 'Gallery', icon: <PhotoLibraryIcon />, path: `/events/${id}/gallery` },
  ];
  
  // Find the current tab index
  const getCurrentTabIndex = () => {
    if (!currentTab) {
      // Try to determine from the current URL
      const path = window.location.pathname;
      const tabIndex = tabs.findIndex(tab => tab.path === path);
      return tabIndex >= 0 ? tabIndex : 0;
    }
    return currentTab;
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    navigate(tabs[newValue].path);
  };
  
  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle menu item click
  const handleMenuItemClick = (path) => {
    navigate(path);
    handleMenuClose();
  };
  
  return (
    <Paper sx={{ mb: 3 }}>
      {isMobile ? (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
          <Tabs
            value={getCurrentTabIndex()}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="event navigation tabs"
            sx={{ flexGrow: 1 }}
          >
            {tabs.slice(0, 3).map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
              />
            ))}
          </Tabs>
          <IconButton
            aria-label="more"
            aria-controls="event-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="event-menu"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={handleMenuClose}
          >
            {tabs.slice(3).map((tab, index) => (
              <MenuItem 
                key={index} 
                onClick={() => handleMenuItemClick(tab.path)}
              >
                <ListItemIcon>
                  {tab.icon}
                </ListItemIcon>
                <ListItemText primary={tab.label} />
              </MenuItem>
            ))}
          </Menu>
        </Box>
      ) : (
        <Tabs
          value={getCurrentTabIndex()}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="event navigation tabs"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
            />
          ))}
        </Tabs>
      )}
    </Paper>
  );
}

export default EventNavigation;
