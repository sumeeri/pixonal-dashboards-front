import { Button, buttonClasses, Select, selectClasses, SelectProps, Stack, styled } from '@mui/material';

export const DayPickerSelect = styled(Select)({
  border: 'none',
  color: 'white',
  fontWeight: 700,

  ['&::before, &::after']: {
    display: 'none',
  },

  [`& .${selectClasses.icon}`]: {
    width: '20px',
    stroke: 'white',
  },
});

export const EventRangeWrapper = styled(Stack)({
  padding: '19px 16px',
});

export const EventRangeSelect = styled(Select)<SelectProps>({
  width: '100%',
  textTransform: 'none',
});

export const DateRangePickerWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  borderTop: '1px solid #9DA3DC4D',

  ['& .rdp-day']: {
    padding: '6px',
    fontSize: '1rem',
    fontWeight: 400,

    ['&:not(.rdp-range_start, .rdp-range_end)']: {
      ['&:has(+ .rdp-hidden), &:last-child']: {
        borderRadius: '0 25px 25px 0',
      },

      ['&.rdp-hidden + .rdp-day:not(.rdp-range_end), &:first-of-type']: {
        borderRadius: '25px 0 0 25px',
      },
    },

    ['&.rdp-range_start, &.rdp-range_end']: {
      ['& .rdp-day_button']: {
        background: '#fff',
        border: 'none',
        color: '#000536',
        borderRadius: '50%',
        fontWeight: 700,
      },
    },
  },

  ['& .rdp-range_start.rdp-range_end']: {
    borderRadius: '50%',
    background: '#4D5EFF',
  },

  ['& .rdp-range_start']: {
    borderRadius: '25px 0 0 25px',
  },

  ['& .rdp-range_end']: {
    borderRadius: ' 0 25px 25px 0 ',
  },

  ['.rdp-range_middle']: {
    ['& .rdp-day_button']: {
      borderRadius: '50%',
    },
  },

  ['& .rdp-day_button']: {
    border: 'none',
    borderRadius: '50%',
    margin: 'auto auto',

    ['&:hover']: {
      background: '#e7edff',
      color: '#000536',
    },
  },

  ['& .rdp-selected']: {
    background: '#4D5EFF',

    ['&:hover .rdp-day_button']: {
      background: '#4D5EFF',
      color: '#fff',
      opacity: 0.8,
    },
  },

  ['& .rdp-weekday']: {
    textTransform: 'uppercase',
    opacity: 1,
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 400,
    fontFamily: theme.typography.fontFamily,
    lineHeight: '20px',
  },

  ['& .rdp-chevron']: {
    stroke: '#9ca2da',
    fill: '#9ca2da',
  },

  ['& .rdp-today']: {
    color: '#fff',
  },

  ['& .rdp-month']: {
    padding: '1rem',
    fontFamily: theme.typography.fontFamily,
  },

  ['& .rdp-root']: {
    ['& .rdp-nav']: {
      display: 'none',

      right: theme.spacing(2),
      top: theme.spacing(2),

      ['& .rdp-button_previous, & .rdp-button_next']: {
        borderRadius: '50%',

        ['&:hover']: {
          backgroundColor: '#e7edff',
        },
      },
    },

    ['&:last-child .rdp-nav']: {
      display: 'block',
    },
  },
}));

export const CalendarDivider = styled('div')({
  width: 1,
  backgroundColor: '#9DA3DC4D',
});

export const TabsBlock = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(2),
}));

export const RangesButtonsGroup = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(0.5),
}));

export const RangeButton = styled(Button)<{ active: boolean }>(({ active }) => ({
  justifyContent: 'start',
  fontSize: '1rem',
  color: '#fff',
  borderRadius: '8px',
  width: '100%',
  padding: '6px 16px',

  ['&:hover']: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  ...(active && {
    [`&.${buttonClasses.text}`]: {
      backgroundColor: '#4d5eff',
    },
  }),
}));
