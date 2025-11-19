/**
 * Watermark RE/MAX - Mongolfiera singola in basso a destra
 */

export default function RemaxWatermark() {
  return (
    <div className="fixed bottom-8 right-8 pointer-events-none select-none z-0">
      <div className="relative opacity-10">
        {/* Mongolfiera singola */}
        <svg
          width="120"
          height="140"
          viewBox="0 0 120 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pallone mongolfiera */}
          <ellipse
            cx="60"
            cy="50"
            rx="45"
            ry="50"
            fill="#E31B23"
            opacity="0.8"
          />
          <ellipse
            cx="60"
            cy="50"
            rx="35"
            ry="40"
            fill="#0066B2"
            opacity="0.6"
          />
          
          {/* Corde */}
          <line x1="40" y1="95" x2="45" y2="110" stroke="#666" strokeWidth="1.5" />
          <line x1="60" y1="98" x2="60" y2="110" stroke="#666" strokeWidth="1.5" />
          <line x1="80" y1="95" x2="75" y2="110" stroke="#666" strokeWidth="1.5" />
          
          {/* Cestino */}
          <rect
            x="45"
            y="110"
            width="30"
            height="20"
            fill="#8B4513"
            stroke="#654321"
            strokeWidth="1.5"
            rx="2"
          />
          
          {/* Logo RE/MAX text */}
          <text
            x="60"
            y="60"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
          >
            RE/MAX
          </text>
        </svg>
      </div>
    </div>
  );
}
