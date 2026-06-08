import { SliderThumb } from '@mui/material';

export const CustomSliderThumb = (props: any) => {
  return (
    <SliderThumb {...props} type="range">
      <div>
        <svg width="48" height="30" viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="30" rx="15" fill="white" />
          <path
            d="M16.25 17.5L13.75 15L16.25 12.5"
            stroke="#000536"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M31.75 17.5L34.25 15L31.75 12.5"
            stroke="#000536"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </SliderThumb>
  );
};
