import { SVGProps } from 'react';

export const DiagramIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0_12534_31226)">
        <g filter="url(#filter0_d_12534_31226)">
          <path
            d="M10.0001 10.5L1.94323 8.37131C1.42487 10.3332 1.64019 12.4169 2.54881 14.2313C3.45742 16.0458 4.99688 17.4664 6.87837 18.2266L10.0001 10.5ZM10.0001 10.5L10.0874 2.16714C8.23806 2.14778 6.43486 2.74413 4.96177 3.86227C3.48867 4.98041 2.42937 6.55682 1.95071 8.3432L10.0001 10.5ZM18.3334 10.5C18.3334 15.1024 14.6025 18.8334 10.0001 18.8334C5.39772 18.8334 1.66676 15.1024 1.66676 10.5C1.66676 5.89765 5.39772 2.16669 10.0001 2.16669C14.6025 2.16669 18.3334 5.89765 18.3334 10.5Z"
            stroke="#9DA3DC"
            strokeLinecap="round"
            strokeLinejoin="round"
            shapeRendering="crispEdges"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_12534_31226"
          x="-2.83325"
          y="1.66669"
          width="25.6667"
          height="25.6667"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_12534_31226" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_12534_31226" result="shape" />
        </filter>
        <clipPath id="clip0_12534_31226">
          <rect width="20" height="20" fill="white" transform="translate(0 0.5)" />
        </clipPath>
      </defs>
    </svg>
  );
};
