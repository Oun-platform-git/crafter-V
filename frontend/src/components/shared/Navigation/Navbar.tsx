import { FC, useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  useTheme,
  useScrollTrigger,
  Slide,
  Badge,
  Tooltip,
  styled,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Dashboard as DashboardIcon,
  Movie as MovieIcon,
  Settings as SettingsIcon,
  VideoLibrary as LibraryIcon,
  Logout as LogoutIcon,
  Create as CreateIcon,
  Lightbulb as AIIcon,
  Analytics as AnalyticsIcon,
  Palette as ThemeIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';

interface NavbarProps {
  onThemeToggle: () => void;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(45deg, #1a1a1a 30%, #2c2c2c 90%)'
    : 'linear-gradient(45deg, #ffffff 30%, #f5f5f5 90%)',
  backdropFilter: 'blur(8px)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 3px 5px 2px rgba(0, 0, 0, .3)'
    : '0 3px 5px 2px rgba(0, 0, 0, .1)',
  transition: 'all 0.3s ease-in-out',
}));

const LogoText = styled(Typography)(() => ({
  background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold',
  fontSize: '1.5rem',
  letterSpacing: '1px',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const AnimatedIconButton = styled(IconButton)(() => ({
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  borderRadius: '20px',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 8px rgba(255, 255, 255, 0.2)'
      : '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const Navbar: FC<NavbarProps> = ({ onThemeToggle }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNotificationAnchor(null);
  };

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <StyledAppBar 
        position="fixed" 
        elevation={isScrolled ? 4 : 0}
        sx={{
          bgcolor: isScrolled ? 'background.paper' : 'transparent',
        }}
      >
        <Toolbar>
          <AnimatedIconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </AnimatedIconButton>

          <LogoText variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
            CrafterV
          </LogoText>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <NavButton
              color="inherit"
              startIcon={<DashboardIcon />}
            >
              Dashboard
            </NavButton>
            <NavButton
              color="inherit"
              startIcon={<MovieIcon />}
            >
              Projects
            </NavButton>
            <NavButton
              color="inherit"
              startIcon={<LibraryIcon />}
            >
              Library
            </NavButton>
            <NavButton
              color="inherit"
              startIcon={<AIIcon />}
            >
              AI Studio
            </NavButton>
            <NavButton
              color="inherit"
              startIcon={<AnalyticsIcon />}
            >
              Analytics
            </NavButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Create New">
              <AnimatedIconButton color="inherit">
                <CreateIcon />
              </AnimatedIconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <AnimatedIconButton 
                color="inherit"
                onClick={handleNotificationClick}
              >
                <NotificationBadge
                  variant="dot"
                  overlap="circular"
                >
                  <NotificationsIcon />
                </NotificationBadge>
              </AnimatedIconButton>
            </Tooltip>

            <Tooltip title="Toggle Theme">
              <AnimatedIconButton 
                color="inherit"
                onClick={onThemeToggle}
              >
                <ThemeIcon />
              </AnimatedIconButton>
            </Tooltip>

            <Tooltip title="Account">
              <AnimatedIconButton
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <AccountCircle />
                </Avatar>
              </AnimatedIconButton>
            </Tooltip>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                    transform: 'translateX(4px)',
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <GitHubIcon fontSize="small" />
              </ListItemIcon>
              GitHub
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>

          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 300,
                maxHeight: 400,
                overflowY: 'auto',
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleClose}>
              <Box>
                <Typography variant="subtitle2">New AI Feature Available</Typography>
                <Typography variant="body2" color="text.secondary">
                  Try out our new AI-powered video enhancement tools!
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Box>
                <Typography variant="subtitle2">Project Export Complete</Typography>
                <Typography variant="body2" color="text.secondary">
                  Your video has been successfully exported.
                </Typography>
              </Box>
            </MenuItem>
          </Menu>
        </Toolbar>

        <style>
          {`
            @keyframes gradientShift {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }

            .gradient-text {
              background-size: 200% auto;
              animation: gradientShift 3s ease infinite;
            }
          `}
        </style>
      </StyledAppBar>
    </Slide>
  );
};

export default Navbar;
