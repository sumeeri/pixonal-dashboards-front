import { FilledInput, InputAdornment } from '@mui/material';
import { SearchIcon } from 'shared/icons';

const sx = {
  width: '100%',
  padding: '0',

  svg: {
    stroke: '#9298CA',
  },

  '& .MuiInputAdornment-root': {
    marginRight: '20px',
  },

  '& ::placeholder': {
    fontFamily: 'RadioGrotesk, "Radio Grotesk"',
    fontSize: '22px',
    color: '#9DA3DC',
    opacity: 1,
  },
};

export const SearchInput = ({ value, setValue }: { value: string; setValue: (value: string) => void }) => {
  return (
    <FilledInput
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder="Search All Locations"
      sx={sx}
      size="small"
      disableUnderline
      type="text"
      inputProps={{ 'aria-label': 'search' }}
      startAdornment={
        <InputAdornment position="start">
          <SearchIcon />
        </InputAdornment>
      }
    />
  );
};
