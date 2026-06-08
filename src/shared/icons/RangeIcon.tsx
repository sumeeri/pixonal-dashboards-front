import { SVGProps } from 'react';

export const RangeIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M14 14V2M2 14V2M4.33333 8H11.6667M11.6667 10L11.6667 6M4.33333 10L4.33333 6"
        stroke="#9298CA"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
