/**
 * Watermark RE/MAX - Logo ufficiale mongolfiera full-page
 * 1 logo grande per pagina, centrato
 */

export default function RemaxWatermark() {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-0">
      <div className="relative opacity-[0.03]">
        {/* Logo RE/MAX ufficiale - mongolfiera */}
        <img
          src="/remax-logo-watermark.png"
          alt="RE/MAX"
          className="w-auto h-screen max-h-[90vh] object-contain"
          style={{
            filter: 'grayscale(0%)',
            mixBlendMode: 'multiply'
          }}
        />
      </div>
    </div>
  );
}
