import { SVGProps } from 'react';

export const BigArrowIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6.6665 20H33.3332M33.3332 20L23.3332 10M33.3332 20L23.3332 30"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
