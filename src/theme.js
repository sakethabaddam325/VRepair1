import { createTheme, alpha } from '@mui/material/styles';

let theme = createTheme();

theme = createTheme(theme, {
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '12px',
          minWidth: 0,
          fontSize: '11px',
          lineHeight: '14px',
          padding: '2px 10px',
          fontWeight: 400,
        },
        outlined: {
          borderColor: theme.palette.grey[400],
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          '&:hover': {
            borderColor: theme.palette.grey[600],
            backgroundColor: theme.palette.grey[50],
          },
        },
        contained: {
          backgroundColor: theme.palette.grey[200],
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.grey[300],
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '3px',
          backgroundColor: theme.palette.background.paper,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.grey[400],
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.grey[500],
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            borderWidth: 1,
          },
        },
        input: {
          fontSize: '12px',
          lineHeight: '14px',
          paddingTop: '4px',
          paddingBottom: '4px',
          paddingLeft: '6px',
          paddingRight: '6px',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: '12px',
          lineHeight: '14px',
        },
      },
    },
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
        elevation: 0,
      },
      styleOverrides: {
        root: {
          '&:before': { display: 'none' },
          boxShadow: 'none',
          border: '1px solid #87CEEB',
          borderRadius: '2px !important',
          marginBottom: '4px',
          '&.Mui-expanded': {
            margin: '0 0 4px 0',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: 30,
          backgroundColor: '#FAFAFA',
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexDirection: 'row-reverse',
          paddingLeft: '4px',
          paddingRight: '8px',
          '&:hover': {
            backgroundColor: '#E8E8E8',
          },
          '&.Mui-expanded': {
            minHeight: 30,
          },
        },
        content: {
          marginTop: '3px',
          marginBottom: '3px',
          marginLeft: '4px',
          '&.Mui-expanded': {
            marginTop: '3px',
            marginBottom: '3px',
          },
          '& .MuiTypography-root': {
            color: theme.palette.text.primary,
            fontWeight: 700,
            fontSize: '12px',
          },
        },
        expandIconWrapper: {
          color: '#fff',
          backgroundColor: '#87CEEB',
          borderRadius: '3px',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 0,
          '& .MuiSvgIcon-root': {
            fontSize: '14px',
          },
          '&.Mui-expanded': {
            color: '#fff',
            backgroundColor: '#87CEEB',
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '8px 10px',
          backgroundColor: theme.palette.background.paper,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 30,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
        indicator: {
          display: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 28,
          textTransform: 'none',
          fontSize: '12px',
          fontWeight: 400,
          paddingTop: '4px',
          paddingBottom: '4px',
          paddingLeft: '12px',
          paddingRight: '12px',
          marginLeft: '2px',
          marginRight: '2px',
          borderRadius: '3px',
          color: '#0077B4',
          border: 'none',
          '&.Mui-selected': {
            color: '#0077B4',
            fontWeight: 700,
            border: '1px solid #0077B4',
            borderRadius: '3px',
            backgroundColor: '#E8F4FD',
          },
          '&:hover': {
            color: '#005A8C',
            backgroundColor: alpha('#0077B4', 0.04),
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: theme.palette.divider,
          fontSize: '12px',
          lineHeight: '14px',
          paddingTop: '4px',
          paddingBottom: '4px',
          paddingLeft: '8px',
          paddingRight: '8px',
        },
        head: {
          fontWeight: 700,
          backgroundColor: theme.palette.grey[100],
          fontSize: '12px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: theme.palette.warning.light,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius,
          fontSize: theme.typography.caption.fontSize,
          lineHeight: theme.typography.caption.lineHeight,
          padding: theme.spacing(0.5, 1),
          boxShadow: theme.shadows[2],
        },
        arrow: {
          color: theme.palette.warning.light,
          '&::before': {
            border: `1px solid ${theme.palette.divider}`,
          },
        },
      },
    },
  },
});

export default theme;
