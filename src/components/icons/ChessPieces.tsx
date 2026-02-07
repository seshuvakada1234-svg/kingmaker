import type { SVGProps } from 'react';

const sharedProps: SVGProps<SVGSVGElement> = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 45 45",
  xmlns: "http://www.w3.org/2000/svg",
};

// --- DEFS for styles ---
const SvgDefs = () => (
  <defs>
    <filter id="white-piece-shadow" x="-0.2" y="-0.2" width="1.4" height="1.4">
      <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.3"/>
    </filter>
  </defs>
);

// --- PIECE PATHS (accepting props) ---
const KingPath = (props: SVGProps<SVGPathElement>) => <path {...props} d="M22.5 6 L20.5 6 L20.5 8 L18.5 8 L18.5 10 L20.5 10 L20.5 12 L24.5 12 L24.5 10 L26.5 10 L26.5 8 L24.5 8 L24.5 6 Z M22.5,14 C17,14 14,18 14,22 L14,28 C14,29 15,30 16,30 L29,30 C30,30 31,29 31,28 L31,22 C31,18 28,14 22.5,14 Z M13.5,32 L31.5,32 L31.5,39 L13.5,39 Z" />;
const QueenPath = (props: SVGProps<SVGPathElement>) => <path {...props} d="M12.5 8 A 2 2 0 0 1 14.5 10 A 2 2 0 0 1 12.5 12 A 2 2 0 0 1 10.5 10 A 2 2 0 0 1 12.5 8 Z M22.5 8 A 2 2 0 0 1 24.5 10 A 2 2 0 0 1 22.5 12 A 2 2 0 0 1 20.5 10 A 2 2 0 0 1 22.5 8 Z M32.5 8 A 2 2 0 0 1 34.5 10 A 2 2 0 0 1 32.5 12 A 2 2 0 0 1 30.5 10 A 2 2 0 0 1 32.5 8 Z M11.5,14 L33.5,14 C30.5,20 14.5,20 11.5,14 Z M14,22 C14,27 17.5,30 22.5,30 C27.5,30 31,27 31,22 L14,22 Z M13.5,32 L31.5,32 L31.5,39 L13.5,39 Z" />;
const RookPath = (props: SVGProps<SVGPathElement>) => <path {...props} d="M14 9 L14 15 L19 15 L19 12 L26 12 L26 15 L31 15 L31 9 Z M13,17 L32,17 L32,30 L13,30 L13,17 Z M13,32 L32,32 L32,39 L13,39 Z" />;
const BishopPath = (props: SVGProps<SVGPathElement>) => <path {...props} d="M22.5 8 A 2.5 2.5 0 0 1 25 10.5 A 2.5 2.5 0 0 1 22.5 13 A 2.5 2.5 0 0 1 20 10.5 A 2.5 2.5 0 0 1 22.5 8 Z M18,15 L27,15 C29,20 29,25 22.5,29 C16,25 16,20 18,15 Z M13,31 L32,31 L32,38 L13,38 Z" />;
const KnightPath = (props: SVGProps<SVGPathElement>) => <path {...props} d="M16 10 C18 6 23 6 25 10 C27 14 24 18 20 18 C18 22 20 28 26 29 L28 29 C31 29 32 27 32 25 C32 20 28 18 28 18 C31 16 32 12 29 10 C27 8 23 8 21 11 C20 9 18 8 16 10 Z M13,31 L32,31 L32,38 L13,38 Z" />;
const PawnPath = (props: SVGProps<SVGPathElement>) => <path {...props} d="M22.5,11.5 A 3.5 3.5 0 0 1 26 15 A 3.5 3.5 0 0 1 22.5 18.5 A 3.5 3.5 0 0 1 19 15 A 3.5 3.5 0 0 1 22.5 11.5 Z M18,20 L27,20 L27,28 L18,28 Z M14,30 L31,30 L31,37 L14,37 Z" />;

const pieceStyleProps = {
  strokeWidth: "1.5",
  strokeLinejoin: "round" as const,
};

// --- WHITE PIECES ---
export const WhitePawn = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <SvgDefs />
    <g filter="url(#white-piece-shadow)">
      <PawnPath fill="#FFFFFF" stroke="#000000" {...pieceStyleProps} />
    </g>
  </svg>
);
export const WhiteRook = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g filter="url(#white-piece-shadow)">
            <RookPath fill="#FFFFFF" stroke="#000000" {...pieceStyleProps} />
        </g>
    </svg>
);
export const WhiteKnight = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g filter="url(#white-piece-shadow)">
            <KnightPath fill="#FFFFFF" stroke="#000000" {...pieceStyleProps} />
        </g>
    </svg>
);
export const WhiteBishop = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g filter="url(#white-piece-shadow)">
            <BishopPath fill="#FFFFFF" stroke="#000000" {...pieceStyleProps} />
        </g>
    </svg>
);
export const WhiteQueen = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g filter="url(#white-piece-shadow)">
            <QueenPath fill="#FFFFFF" stroke="#000000" {...pieceStyleProps} />
        </g>
    </svg>
);
export const WhiteKing = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <SvgDefs />
        <g filter="url(#white-piece-shadow)">
            <KingPath fill="#FFFFFF" stroke="#000000" {...pieceStyleProps} />
        </g>
    </svg>
);

// --- BLACK PIECES ---
export const BlackPawn = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <g>
      <PawnPath fill="#000000" stroke="none" />
    </g>
  </svg>
);
export const BlackRook = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <g>
            <RookPath fill="#000000" stroke="none" />
        </g>
    </svg>
);
export const BlackKnight = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <g>
            <KnightPath fill="#000000" stroke="none" />
        </g>
    </svg>
);
export const BlackBishop = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <g>
            <BishopPath fill="#000000" stroke="none" />
        </g>
    </svg>
);
export const BlackQueen = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <g>
            <QueenPath fill="#000000" stroke="none" />
        </g>
    </svg>
);
export const BlackKing = (props: SVGProps<SVGSVGElement>) => (
    <svg {...sharedProps} {...props}>
        <g>
            <KingPath fill="#000000" stroke="none" />
        </g>
    </svg>
);
