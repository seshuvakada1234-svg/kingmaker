import type { SVGProps } from 'react';

const sharedProps: SVGProps<SVGSVGElement> = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 45 45",
};

export const WhitePawn = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5,11.5 A 4,4 0 1,1 22.5,3.5 A 4,4 0 1,1 22.5,11.5" />
      <path d="M22.5,11.5 V 28.5" />
      <path d="M15.5,38.5 L 29.5,38.5 L 29.5,28.5 L 15.5,28.5 Z" />
    </g>
  </svg>
);
export const BlackPawn = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5,11.5 A 4,4 0 1,1 22.5,3.5 A 4,4 0 1,1 22.5,11.5" />
      <path d="M22.5,11.5 V 28.5" />
      <path d="M15.5,38.5 L 29.5,38.5 L 29.5,28.5 L 15.5,28.5 Z" />
    </g>
  </svg>
);
export const WhiteRook = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 38.5 L 33 38.5 L 33 31.5 L 12 31.5 Z" />
        <path d="M14 31.5 L 31 31.5 L 31 12.5 L 14 12.5 Z" />
        <path d="M14 12.5 L 14 6.5 L 19 6.5 L 19 9.5 L 26 9.5 L 26 6.5 L 31 6.5 L 31 12.5" />
    </g>
  </svg>
);
export const BlackRook = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 38.5 L 33 38.5 L 33 31.5 L 12 31.5 Z" />
        <path d="M14 31.5 L 31 31.5 L 31 12.5 L 14 12.5 Z" />
        <path d="M14 12.5 L 14 6.5 L 19 6.5 L 19 9.5 L 26 9.5 L 26 6.5 L 31 6.5 L 31 12.5" />
    </g>
  </svg>
);
export const WhiteKnight = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
      <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 38.5 L 33 38.5 L 33 31.5 L 12 31.5 Z" />
          <path d="M15 31.5 C 17 29.5 20 22 20 16.5 C 20 11 25 11 25 11 C 28 11 31 13 31 18 C 31 22 27 25 27 31.5" />
          <path d="M25 11 C 24 9 22 7.5 20.5 7.5 C 19 7.5 17 9.5 17 11.5" />
      </g>
  </svg>
);
export const BlackKnight = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 38.5 L 33 38.5 L 33 31.5 L 12 31.5 Z" />
        <path d="M15 31.5 C 17 29.5 20 22 20 16.5 C 20 11 25 11 25 11 C 28 11 31 13 31 18 C 31 22 27 25 27 31.5" />
        <path d="M25 11 C 24 9 22 7.5 20.5 7.5 C 19 7.5 17 9.5 17 11.5" />
    </g>
  </svg>
);
export const WhiteBishop = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
      <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 38.5 L 33 38.5 L 33 31.5 L 12 31.5 Z" />
          <path d="M16.5 31.5 L 28.5 31.5 C 28.5 24.5 20.5 18 22.5 10.5 C 24.5 18 16.5 24.5 16.5 31.5" />
          <path d="M22.5 10.5 A 2 2 0 1 1 22.5 6.5 A 2 2 0 1 1 22.5 10.5" />
      </g>
  </svg>
);
export const BlackBishop = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 38.5 L 33 38.5 L 33 31.5 L 12 31.5 Z" />
        <path d="M16.5 31.5 L 28.5 31.5 C 28.5 24.5 20.5 18 22.5 10.5 C 24.5 18 16.5 24.5 16.5 31.5" />
        <path d="M22.5 10.5 A 2 2 0 1 1 22.5 6.5 A 2 2 0 1 1 22.5 10.5" />
    </g>
  </svg>
);
export const WhiteQueen = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
      <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 38.5 L 33 38.5 L 33 31.5 L 12 31.5 Z" />
          <path d="M13 31.5 L 32 31.5 L 28 12.5 L 17 12.5 Z" />
          <path d="M12 8.5 L 17 12.5 L 22.5 8.5 L 28 12.5 L 33 8.5" />
          <circle cx="12" cy="6.5" r="2" />
          <circle cx="22.5" cy="6.5" r="2" />
          <circle cx="33" cy="6.5" r="2" />
      </g>
  </svg>
);
export const BlackQueen = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 38.5 L 33 38.5 L 33 31.5 L 12 31.5 Z" />
        <path d="M13 31.5 L 32 31.5 L 28 12.5 L 17 12.5 Z" />
        <path d="M12 8.5 L 17 12.5 L 22.5 8.5 L 28 12.5 L 33 8.5" />
        <circle cx="12" cy="6.5" r="2" />
        <circle cx="22.5" cy="6.5" r="2" />
        <circle cx="33" cy="6.5" r="2" />
    </g>
  </svg>
);
export const WhiteKing = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
      <g fill="#FFF" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 38.5 L 33 38.5 L 33 31.5 L 12 31.5 Z" />
          <path d="M16 31.5 L 29 31.5 L 29 16.5 L 16 16.5 Z" />
          <path d="M22.5 16.5 L 22.5 6.5" />
          <path d="M19.5 9.5 L 25.5 9.5" />
      </g>
  </svg>
);
export const BlackKing = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g fill="#000" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 38.5 L 33 38.5 L 33 31.5 L 12 31.5 Z" />
        <path d="M16 31.5 L 29 31.5 L 29 16.5 L 16 16.5 Z" />
        <path d="M22.5 16.5 L 22.5 6.5" />
        <path d="M19.5 9.5 L 25.5 9.5" />
    </g>
  </svg>
);
