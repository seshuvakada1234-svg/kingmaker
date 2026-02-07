import type { SVGProps } from 'react';

const sharedProps: SVGProps<SVGSVGElement> = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 45 45",
};

export const WhitePawn = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5 35.5 A 3.5 3.5 0 0 1 22.5 28.5 A 3.5 3.5 0 0 1 22.5 35.5" />
      <path d="M22.5 32 C 22.5 32 22.5 30 22.5 30 C 24.5 30 24.5 28 24.5 28 C 24.5 26 22.5 25 22.5 25 C 22.5 25 22.5 23 22.5 23 C 24.5 23 24.5 21 24.5 21 C 24.5 19 22.5 18 22.5 18 L 22.5 14.5" fill="none" />
      <path d="M22.5 32 C 22.5 32 22.5 30 22.5 30 C 20.5 30 20.5 28 20.5 28 C 20.5 26 22.5 25 22.5 25 C 22.5 25 22.5 23 22.5 23 C 20.5 23 20.5 21 20.5 21 C 20.5 19 22.5 18 22.5 18 L 22.5 14.5" fill="none" />
      <path d="M22.5 11.5 A 2 2 0 1 1 22.5 7.5 A 2 2 0 1 1 22.5 11.5" />
    </g>
  </svg>
);
export const BlackPawn = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5 35.5 A 3.5 3.5 0 0 1 22.5 28.5 A 3.5 3.5 0 0 1 22.5 35.5" />
      <path d="M22.5 32 C 22.5 32 22.5 30 22.5 30 C 24.5 30 24.5 28 24.5 28 C 24.5 26 22.5 25 22.5 25 C 22.5 25 22.5 23 22.5 23 C 24.5 23 24.5 21 24.5 21 C 24.5 19 22.5 18 22.5 18 L 22.5 14.5" fill="none" />
      <path d="M22.5 32 C 22.5 32 22.5 30 22.5 30 C 20.5 30 20.5 28 20.5 28 C 20.5 26 22.5 25 22.5 25 C 22.5 25 22.5 23 22.5 23 C 20.5 23 20.5 21 20.5 21 C 20.5 19 22.5 18 22.5 18 L 22.5 14.5" fill="none" />
      <path d="M22.5 11.5 A 2 2 0 1 1 22.5 7.5 A 2 2 0 1 1 22.5 11.5" />
    </g>
  </svg>
);
export const WhiteRook = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z" />
      <path d="M14 29.5v-13h17v13H14z" fill="none" />
      <path d="M14 16.5L11 14h23l-3 2.5H14z" />
      <path d="M11 14V9h4v2h5V9h5v2h5V9h4v5" />
    </g>
  </svg>
);
export const BlackRook = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z" />
      <path d="M14 29.5v-13h17v13H14z" fill="none" />
      <path d="M14 16.5L11 14h23l-3 2.5H14z" />
      <path d="M11 14V9h4v2h5V9h5v2h5V9h4v5" />
    </g>
  </svg>
);
export const WhiteKnight = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10c1.5 0 3.5 1 4.5 3s.5 4.5-.5 6.5c-1 2-2.5 2.5-2.5 2.5l-2 2h-10c0-2.5 1-5 2-7 1-2 2.5-4 4-4.5 1.5-.5 3-1.5 3-1.5z" />
      <path d="M12.5 31.5h15l-1.5-2.5-2-2.5-2-2.5-2-2.5-2-2.5-2-2.5-2-2.5-2-2.5-2-2.5-2-2.5" fill="none" />
      <path d="M12.5 31.5c-2 0-3.5-1.5-3.5-3.5 0-2 1.5-3.5 3.5-3.5" />
      <path d="M27.5 31.5c2 0 3.5-1.5 3.5-3.5 0-2-1.5-3.5-3.5-3.5" />
    </g>
  </svg>
);
export const BlackKnight = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10c1.5 0 3.5 1 4.5 3s.5 4.5-.5 6.5c-1 2-2.5 2.5-2.5 2.5l-2 2h-10c0-2.5 1-5 2-7 1-2 2.5-4 4-4.5 1.5-.5 3-1.5 3-1.5z" />
      <path d="M12.5 31.5h15l-1.5-2.5-2-2.5-2-2.5-2-2.5-2-2.5-2-2.5-2-2.5-2-2.5-2-2.5-2-2.5" fill="none" />
      <path d="M12.5 31.5c-2 0-3.5-1.5-3.5-3.5 0-2 1.5-3.5 3.5-3.5" />
      <path d="M27.5 31.5c2 0 3.5-1.5 3.5-3.5 0-2-1.5-3.5-3.5-3.5" />
    </g>
  </svg>
);
export const WhiteBishop = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 36h27v-2H9v2zm13.5-3s-2-2-2-6.5c0-4.5-2-4.5-2-4.5-2-1-2-2.5-2-2.5s3.5-1 6.5-1 6.5 1 6.5 1c0 0 0 1.5-2 2.5 0 0-2 0-2 4.5 0 4.5 2 6.5 2 6.5z" />
      <path d="M22.5 11.5l-1.5-1.5h-2l-1.5 1.5" />
      <path d="M22.5 11.5l1.5-1.5h2l1.5 1.5" />
    </g>
  </svg>
);
export const BlackBishop = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 36h27v-2H9v2zm13.5-3s-2-2-2-6.5c0-4.5-2-4.5-2-4.5-2-1-2-2.5-2-2.5s3.5-1 6.5-1 6.5 1 6.5 1c0 0 0 1.5-2 2.5 0 0-2 0-2 4.5 0 4.5 2 6.5 2 6.5z" />
      <path d="M22.5 11.5l-1.5-1.5h-2l-1.5 1.5" />
      <path d="M22.5 11.5l1.5-1.5h2l1.5 1.5" />
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
