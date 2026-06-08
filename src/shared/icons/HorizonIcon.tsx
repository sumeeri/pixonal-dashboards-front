import { SVGProps } from 'react';

export const HorizonIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0_14001_23567)">
        <path
          d="M8.00016 1.33301V14.6663M12.7142 3.28563L3.28612 12.7137M14.6668 7.99967H1.3335M12.7142 12.7137L3.28612 3.28563"
          stroke="#9298CA"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_14001_23567">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
