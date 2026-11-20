import { useMemo } from 'react';
import { formatINR } from '../lib/investmentEngine';

function buildQrMatrix(seedText: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false),
  );

  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const border = r === 0 || r === 6 || c === 0 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = border || inner;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;
      if (r === 6 || c === 6) {
        grid[r][c] = (r + c) % 2 === 0;
        continue;
      }
      hash ^= r * 31 + c * 17;
      hash = Math.imul(hash, 16777619);
      grid[r][c] = (hash >>> 0) % 3 !== 0;
    }
  }

  return grid;
}

export function QrMatrix({
  upiUri,
  amount,
}: {
  upiUri: string;
  amount: number;
}) {
  const qrMatrix = useMemo(() => buildQrMatrix(upiUri), [upiUri]);
  return (
    <div className="p-3 bg-white rounded-2xl border border-[#E5E2DA] shadow-xs inline-block">
      <svg
        role="img"
        aria-label={`UPI Payment QR Code for ${formatINR(amount)}`}
        viewBox="0 0 21 21"
        className="w-36 h-36 sm:w-40 sm:h-40"
        shapeRendering="crispEdges"
      >
        <rect width="21" height="21" fill="#ffffff" />
        {qrMatrix.map((row, r) =>
          row.map((on, c) =>
            on ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                fill="#11151E"
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  );
}
