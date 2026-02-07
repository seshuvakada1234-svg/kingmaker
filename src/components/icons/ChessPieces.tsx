import type { SVGProps } from 'react';

const sharedProps: SVGProps<SVGSVGElement> = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 45 45",
  fill: "none",
};

export const WhitePawn = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5 36c-2.21 0-4-1.79-4-4 0-1.474.802-2.756 2-3.465V28.5h4v.035c1.198.71 2 1.99 2 3.465 0 2.21-1.79 4-4 4z" />
      <path d="M22.5 36V9.5" />
      <path d="M22.5 9.5c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
    </g>
  </svg>
);
export const BlackPawn = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5 36c-2.21 0-4-1.79-4-4 0-1.474.802-2.756 2-3.465V28.5h4v.035c1.198.71 2 1.99 2 3.465 0 2.21-1.79 4-4 4z" />
      <path d="M22.5 36V9.5" />
      <path d="M22.5 9.5c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
    </g>
  </svg>
);
export const WhiteRook = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
      <path d="M34 14l-3 3H14l-3-3" />
      <path d="M31 17v12.5H14V17" />
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
    </g>
  </svg>
);
export const BlackRook = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
      <path d="M34 14l-3 3H14l-3-3" />
      <path d="M31 17v12.5H14V17" />
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
    </g>
  </svg>
);
export const WhiteKnight = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10c1.5 0 3.5 1 4.5 3s.5 4.5-.5 6.5c-1 2-2.5 2.5-2.5 2.5l-2 2h-10c0-2.5 1-5 2-7 1-2 2.5-4 4-4.5 1.5-.5 3-1.5 3-1.5z" />
      <path d="M11.5 25.5l-2 3.5c-1.5 2.5-1.5 5.5.5 7.5 2 2 4.5 2 6.5 0l1-1.5" />
      <path d="M12.5 31.5H25" />
    </g>
  </svg>
);
export const BlackKnight = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10c1.5 0 3.5 1 4.5 3s.5 4.5-.5 6.5c-1 2-2.5 2.5-2.5 2.5l-2 2h-10c0-2.5 1-5 2-7 1-2 2.5-4 4-4.5 1.5-.5 3-1.5 3-1.5z" />
      <path d="M11.5 25.5l-2 3.5c-1.5 2.5-1.5 5.5.5 7.5 2 2 4.5 2 6.5 0l1-1.5" />
      <path d="M12.5 31.5H25" />
    </g>
  </svg>
);
export const WhiteBishop = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 36h27v-2H9v2zm13.5-3s-2-2-2-6.5c0-4.5-2-4.5-2-4.5-2-1-2-2.5-2-2.5s3.5-1 6.5-1 6.5 1 6.5 1c0 0 0 1.5-2 2.5 0 0-2 0-2 4.5 0 4.5-2 6.5-2 6.5z" />
      <path d="M22.5 25c-1.5 0-2.5-1-2.5-1s-1-1.5-1-2.5c0-1 .5-2 1-2.5" />
      <path d="M22.5 14.5c2.5 0 4.5 2 4.5 4.5 0 2.5-2 4.5-4.5 4.5" />
    </g>
  </svg>
);
export const BlackBishop = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 36h27v-2H9v2zm13.5-3s-2-2-2-6.5c0-4.5-2-4.5-2-4.5-2-1-2-2.5-2-2.5s3.5-1 6.5-1 6.5 1 6.5 1c0 0 0 1.5-2 2.5 0 0-2 0-2 4.5 0 4.5-2 6.5-2 6.5z" />
      <path d="M22.5 25c-1.5 0-2.5-1-2.5-1s-1-1.5-1-2.5c0-1 .5-2 1-2.5" />
      <path d="M22.5 14.5c2.5 0 4.5 2 4.5 4.5 0 2.5-2 4.5-4.5 4.5" />
    </g>
  </svg>
);
export const WhiteQueen = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 12a2 2 0 11-4 0 2 2 0 014 0zM41 12a2 2 0 11-4 0 2 2 0 014 0zM22.5 11.5a2 2 0 11-4 0 2 2 0 014 0zM12 14.5a2 2 0 11-4 0 2 2 0 014 0zM37 14.5a2 2 0 11-4 0 2 2 0 014 0z" />
      <path d="M9 26c8.5-1.5 19-1.5 27 0l2-12-7-2-5 5-5.5-13-5.5 13-5-5-7 2z" />
      <path d="M9 26c0 2 1.5 4 4 4h19c2.5 0 4-2 4-4" />
      <path d="M11.5 30c5.5 1.5 16.5 1.5 22 0" />
      <path d="M12 34.5h21" />
      <path d="M11 38.5h23" />
    </g>
  </svg>
);
export const BlackQueen = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 12a2 2 0 11-4 0 2 2 0 014 0zM41 12a2 2 0 11-4 0 2 2 0 014 0zM22.5 11.5a2 2 0 11-4 0 2 2 0 014 0zM12 14.5a2 2 0 11-4 0 2 2 0 014 0zM37 14.5a2 2 0 11-4 0 2 2 0 014 0z" />
      <path d="M9 26c8.5-1.5 19-1.5 27 0l2-12-7-2-5 5-5.5-13-5.5 13-5-5-7 2z" />
      <path d="M9 26c0 2 1.5 4 4 4h19c2.5 0 4-2 4-4" />
      <path d="M11.5 30c5.5 1.5 16.5 1.5 22 0" />
      <path d="M12 34.5h21" />
      <path d="M11 38.5h23" />
    </g>
  </svg>
);
export const WhiteKing = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5 11.63V6M20 8h5" />
      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
      <path d="M12 38.5h21" />
      <path d="M12 34.5h21" />
      <path d="M11.5 30c5.5 1.5 16.5 1.5 22 0" />
      <path d="M9 26c0 2 1.5 4 4 4h19c2.5 0 4-2 4-4-2.5-2-12.5-2.5-27 0z" />
    </g>
  </svg>
);
export const BlackKing = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5 11.63V6M20 8h5" />
      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
      <path d="M12 38.5h21" />
      <path d="M12 34.5h21" />
      <path d="M11.5 30c5.5 1.5 16.5 1.5 22 0" />
      <path d="M9 26c0 2 1.5 4 4 4h19c2.5 0 4-2 4-4-2.5-2-12.5-2.5-27 0z" />
    </g>
  </svg>
);
