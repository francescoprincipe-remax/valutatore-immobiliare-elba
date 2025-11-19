/**
 * Watermark RE/MAX - Logo mongolfiera full-page
 * 1 logo grande per pagina, centrato
 */

export default function RemaxWatermark() {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-0">
      <div className="relative opacity-[0.03]">
        {/* Logo RE/MAX mongolfiera grande - full page */}
        <svg
          width="800"
          height="900"
          viewBox="0 0 800 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="max-w-full max-h-screen"
        >
          {/* Pallone mongolfiera */}
          <ellipse
            cx="400"
            cy="350"
            rx="300"
            ry="350"
            fill="#E31B23"
            opacity="0.9"
          />
          <ellipse
            cx="400"
            cy="350"
            rx="230"
            ry="280"
            fill="#0066B2"
            opacity="0.7"
          />
          
          {/* Corde */}
          <line x1="250" y1="650" x2="300" y2="750" stroke="#666" strokeWidth="8" />
          <line x1="400" y1="680" x2="400" y2="750" stroke="#666" strokeWidth="8" />
          <line x1="550" y1="650" x2="500" y2="750" stroke="#666" strokeWidth="8" />
          
          {/* Cestino */}
          <rect
            x="300"
            y="750"
            width="200"
            height="120"
            fill="#8B4513"
            stroke="#654321"
            strokeWidth="8"
            rx="10"
          />
          
          {/* Logo RE/MAX text grande */}
          <text
            x="400"
            y="400"
            textAnchor="middle"
            fill="white"
            fontSize="120"
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
