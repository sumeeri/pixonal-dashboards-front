import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: ['RadioGrotesk, "Radio Grotesk"'].join(','),
  },

  palette: {
    primary: {
      main: '#000536',
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: '#0D144E',
    },
    success: {
      main: '#6aeb86',
      contrastText: '#000536',
    },
    warning: {
      main: '#ebbf6a',
      contrastText: '#000536',
    },
    info: {
      main: '#9fc0e7',
    },
    error: {
      main: '#fd0000',
    },
    text: {
      primary: '#9DA3DC',
    },
  },

  components: {
    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(157, 163, 220, 0.5)' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minWidth: 'auto',
          display: 'flex',
          gap: '0.5rem',
          lineHeight: '1.5rem',
          textTransform: 'capitalize',

          '&.Mui-disabled': {
            border: '1px solid #9298CA66',
            background: 'transparent',
            color: '#9298CA',

            svg: {
              path: {
                stroke: '#9298CA',
              },
            },
          },

          '&.MuiButton-contained': {
            fontWeight: 400,
          },
        },

        endIcon: {
          margin: 0,
        },
        startIcon: {
          margin: 0,
        },
        sizeMedium: {
          fontSize: '1rem',
          padding: '1rem',
          borderRadius: '40px',
        },

        outlined: {
          color: '#fff',
          background: '#9298CA66',
          border: '1px solid #9298CA',

          ':hover': {
            background: '#9298CA66',
            border: '1px solid #9298CA',
          },
        },

        contained: {
          background: '#4D5EFF',
          color: '#fff',
          border: '1px solid #4D5EFF',

          ':hover': {
            background: '#4D5EFF',
          },
        },

        sizeSmall: {
          fontSize: '18px',
          lineHeight: '24px',
          padding: '0.5rem 1rem',
          borderRadius: '40px',
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        colorSecondary: {
          background: '#ffffff',
          ':hover': {
            background: '#262b58',
          },
        },
        sizeMedium: {
          padding: '18px',
        },
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          background: '#00000066',
          backdropFilter: 'blur(30px)',
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {},
      },
    },

    // SELECT OPTIONS

    MuiSelect: {
      styleOverrides: {
        root: {
          color: '#fff',
          fontSize: '16px',
          lineHeight: '18px',

          '& div.Mui-disabled': {
            color: '#323757',
            WebkitTextFillColor: 'unset',
          },
        },

        // @ts-expect-error &.Mui-disabled
        '&.Mui-disabled': {
          WebkitTextFillColor: 'red',
        },

        icon: {
          top: 'auto',
          right: '0',
        },
        filled: {
          background: '#000536',
        },
        select: {
          padding: 0,
          paddingLeft: '0',
          minHeight: 'auto',
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: '0',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          marginBottom: '4px',
          color: '#fff',
          textTransform: 'capitalize',
          fontSize: '14px',
          lineHeight: '18px',

          '&.Mui-selected': {
            background: '#000000aa',
            ':hover': {
              background: '#00000066',
            },
          },

          ':hover': {
            background: '#00000066',
          },
        },
      },
    },

    MuiList: {
      styleOverrides: {
        root: {
          background: '#00000066',
        },
      },
    },

    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: '#282828cc',

          '&.MuiBackdrop-invisible': {
            backgroundColor: 'transparent',
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #9DA3DC33',
          boxShadow: 'none',
          margin: '1rem 0',
          borderRadius: '1rem',
          backgroundColor: 'transparent',
          backdropFilter: 'blur(30px)',

          '&.MuiAccordion-root::before': {
            backgroundColor: 'unset',
          },
        },
      },
    },

    MuiListSubheader: {
      styleOverrides: {
        root: {
          marginBottom: '12px',
          paddingLeft: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          color: 'white',
          textTransform: 'uppercase',
          borderBottom: '1px solid #9DA3DC4D',
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          border: 'none',
        },
      },
    },

    // MuiChip: {
    //   styleOverrides: {
    //     sizeMedium: {
    //       height: 'auto',
    //       padding: '8px 20px',
    //       display: 'flex',
    //       flexDirection: 'row-reverse',
    //       gap: '10px',
    //       fontFamily: 'DM Mono, monospace',
    //       fontSize: '24px',
    //       fontWeight: 500,
    //       borderRadius: '30px',
    //     },
    //     sizeSmall: {
    //       height: 'auto',
    //       padding: '0 14px',
    //       display: 'flex',
    //       fontSize: '14px',
    //       lineHeight: '24px',
    //       fontWeight: 700,
    //       border: '1px solid #9DA3DC',
    //       borderRadius: '40px',
    //     },
    //     label: {
    //       padding: 0,
    //     },
    //     icon: {
    //       margin: 0,
    //     },
    //   },
    // },

    MuiAccordion: {
      styleOverrides: {
        root: {
          padding: '0',
          margin: 0,
          background: '#00000066',
          borderRadius: '20px',

          ':last-of-type': {
            borderRadius: '20px',
          },
        },
      },
    },

    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: 0,
          '&.Mui-expanded': {
            minHeight: 'auto',
            borderBottom: '1px solid #9DA3DC4D',
          },
        },
        content: {
          margin: 0,
          '&.Mui-expanded': {
            minHeight: 'auto',
            margin: 0,
          },
        },
      },
    },

    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: 0,
          '& .MuiInputBase-root': {
            flexGrow: '1',
            border: 'none',
            color: '#fff',
          },
        },
      },
    },

    MuiCircularProgress: {
      styleOverrides: {
        determinate: {
          color: 'white',
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          textTransform: 'capitalize',
          fontSize: '16px',
          lineHeight: '18px',
          color: '#9DA3DC',
        },
      },
    },

    MuiSlider: {
      styleOverrides: {
        root: {
          height: '2px',
          opacity: 1,
          padding: 0,
          '& .MuiSlider-thumb': {
            // transition: 'left .5s',
            '::before': {
              boxShadow: 'none',
            },
            // ':active': {
            //   transition: 'left 0',
            // },
          },
          '& .MuiSlider-track': {
            color: 'transparent',
          },
        },
        rail: {
          opacity: 0,
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        input: {
          padding: 0,
          '&:-webkit-autofill': {
            borderRadius: 0,
          },
        },
        root: {
          padding: '1rem',
          color: 'white',
          fontSize: '20px',
          lineHeight: '28px',
          borderRadius: '8px',

          '::before': {
            content: `''`,
            border: 'none',
          },

          '::after': {
            content: `''`,
            border: 'none',
          },

          ':focus': {
            border: '1px solid #FFFFFF59',
          },
          '&.Mui-disabled: before': {
            borderBottomStyle: 'none',
          },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 'auto',
        },
        flexContainer: {
          gap: '42px',
        },
        indicator: {
          backgroundColor: 'white',
          transition: 'none',
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          color: '#9DA3DC',
          lineHeight: '20px',
          padding: '32px 0',
          textTransform: 'capitalize',
          fontSize: '18px',

          '&.Mui-selected': {
            color: 'white',
          },
          '&.Mui-disabled': {
            color: 'grey',
          },
        },
      },
    },

    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          gap: '10px',
        },
      },
    },

    MuiToggleButton: {
      styleOverrides: {
        root: {
          background: 'transparent',
          color: '#9DA3DC',
          borderRadius: '21px',
          textTransform: 'capitalize',
          gap: '13px',

          svg: {
            stroke: '#9298CA',
          },

          '&.Mui-selected': {
            background: '#4D5EFF',
            color: 'white',

            '&:hover': {
              backgroundColor: '#4D5EFF',
            },

            svg: {
              stroke: '#fff',
            },
          },

          '&.MuiToggleButtonGroup-firstButton, &.MuiToggleButtonGroup-lastButton': {
            borderRadius: 'inherit',
          },
        },
      },
    },

    MuiPieArcLabel: {
      styleOverrides: {
        root: {
          fontFamily: 'RadioGrotesk, sans-serif',
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '20px',
          whiteSpace: 'pre-line',
          fill: '#ffffff',
        },
      },
    },
  },
});
