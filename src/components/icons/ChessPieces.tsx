import type { SVGProps } from 'react';

const sharedProps: SVGProps<SVGSVGElement> = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 45 45",
};

// --- DEFS for styles ---
// Defined inside each component to ensure they are self-contained.
const SvgDefs = () => (
  <defs>
    <filter id="white-piece-shadow" x="-0.2" y="-0.2" width="1.4" height="1.4">
      <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#000" floodOpacity="0.3"/>
    </filter>
    <linearGradient id="black-piece-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#4d4d4d" />
        <stop offset="100%" stopColor="#2c2c2c" />
    </linearGradient>
  </defs>
);

// --- PIECE PATHS (Cburnett style) ---
const KingPath = () => <path d="M22.5,11.63L22.5,6h-1.5v3h-3v1.5h3v3h1.5v-3h3V9h-3V6z M32,25.5c0,3.31-2.69,6-6,6H19c-3.31,0-6-2.69-6-6V19 c0-3.31,2.69-6,6-6h7c3.31,0,6,2.69,6,6V25.5z M32,31.5v3H13v-3H32z" />;
const QueenPath = () => <path d="M13,13.5l-2,18h23l-2-18H13z M13.5,12c0,3-1,4-1,4l1,2h19l1-2c0,0-1-1-1-4H13.5z M14,7.5c-1.66,0-3,1.34-3,3s1.34,3,3,3s3-1.34,3-3S15.66,7.5,14,7.5z M22.5,7.5c-1.66,0-3,1.34-3,3s1.34,3,3,3s3-1.34,3-3S24.16,7.5,22.5,7.5z M31,7.5c-1.66,0-3,1.34-3,3s1.34,3,3,3s3-1.34,3-3S32.66,7.5,31,7.5z" />;
const RookPath = () => <path d="M14,13.5V11h5v2.5h-5z M20.5,13.5V11h4v2.5h-4z M26,13.5V11h5v2.5h-5z M13,31.5h19v3H13V31.5z M14,15v15h17V15H14z" />;
const BishopPath = () => <path d="M18,13.5c3.31,0,6,2.69,6,6c0,2.21-1.79,4-4,4c-3.31,0-6-2.69-6-6S14.69,13.5,18,13.5z M22.5,10.5c-1.66,0-3-1.34-3-3s1.34-3,3-3s3,1.34,3,3S24.16,10.5,22.5,10.5z M20,29.5c-3-3-6-6-6-9c0-3.31,2.69-6,6-6h5c3.31,0,6,2.69,6,6c0,3-3,6-6,9H20z M14,31.5h17v3H14V31.5z" />;
const KnightPath = () => <path d="M19,10.5c0,1.4,0.4,2.6,1.2,3.5c-1.2,0.8-2.6,1.3-4.2,1.5c0,0-1.2,0.1-1,2c0.2,2.3,1.4,3.5,2,3.5c0.6,0,2.5-1.2,2.5-3c0-1.8-1.5-3-1.5-3s0.8-0.2,1.2-0.2c1.7,0,3.2,0.6,4.3,1.7c-0.3,1-0.5,2-0.5,3c0,2.8,1.2,5,3.5,5s3.5-2.2,3.5-5c0-2.8-1.5-5-4-5c-1.5,0-2.8,0.6-3.8,1.5c-1-1.2-1.2-2.7-1.2-4c0-2.2,1.8-4,4-4s4,1.8,4,4c0,0.8-0.2,1.5-0.6,2.1c0.7,0.4,1.6,0.6,2.6,0.6c2.8,0,5-2.2,5-5c0-2.8-2.2-5-5-5c-2.5,0-4.5,1.8-4.9,4.1C23.9,13.1,21.8,10.5,19,10.5z M13,31.5h19v3H13V31.5z" />;
const PawnPath = () => <path d="M22.5,13.5c-2.21,0-4,1.79-4,4s1.79,4,4,4s4-1.79,4-4S24.71,13.5,22.5,13.5z M22.5,23.5c-4,0-6,2-6,4v3h12v-3C28.5,25.5,26.5,23.5,22.5,23.5z M13,31.5h19v3H13V31.5z" />;

// --- COMPONENTS ---
export const WhitePawn = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <SvgDefs />
    <g filter="url(#white-piece-shadow)">
      <PawnPath fill="#f8f8f8" />
    </g>
  </svg>
);
export const BlackPawn = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <SvgDefs />
    <g>
      <PawnPath fill="url(#black-piece-gradient)" />
    </g>
  </svg>
);
export const WhiteRook = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g filter="url(#white-piece-shadow)">
            <RookPath fill="#f8f8f8" />
        </g>
    </svg>
);
export const BlackRook = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g>
            <RookPath fill="url(#black-piece-gradient)" />
        </g>
    </svg>
);
export const WhiteKnight = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g filter="url(#white-piece-shadow)">
            <KnightPath fill="#f8f8f8" />
        </g>
    </svg>
);
export const BlackKnight = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g>
            <KnightPath fill="url(#black-piece-gradient)" />
        </g>
    </svg>
);
export const WhiteBishop = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g filter="url(#white-piece-shadow)">
            <BishopPath fill="#f8f8f8" />
        </g>
    </svg>
);
export const BlackBishop = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g>
            <BishopPath fill="url(#black-piece-gradient)" />
        </g>
    </svg>
);
export const WhiteQueen = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g filter="url(#white-piece-shadow)">
            <QueenPath fill="#f8f8f8" />
        </g>
    </svg>
);
export const BlackQueen = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g>
            <QueenPath fill="url(#black-piece-gradient)" />
        </g>
    </svg>
);
export const WhiteKing = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g filter="url(#white-piece-shadow)">
            <KingPath fill="#f8f8f8" />
        </g>
    </svg>
);
export const BlackKing = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g>
            <KingPath fill="url(#black-piece-gradient)" />
        </g>
    </svg>
);
