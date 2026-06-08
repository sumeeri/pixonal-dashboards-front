import { SVGProps } from 'react';

export const ClockIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0_12533_15402)">
        <g filter="url(#filter0_d_12533_15402)">
          <path
            d="M18.9166 9.58333L17.2505 11.25L15.5833 9.58333M17.4542 10.8333C17.4845 10.5597 17.5 10.2817 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5C12.3561 17.5 14.4584 16.4136 15.8333 14.7144M10 5.83333V10L12.5 11.6667"
            stroke="#9DA3DC"
            strokeLinecap="round"
            strokeLinejoin="round"
            shapeRendering="crispEdges"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_12533_15402"
          x="-2"
          y="2"
          width="25.4166"
          height="24"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_12533_15402" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_12533_15402" result="shape" />
        </filter>
        <clipPath id="clip0_12533_15402">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
