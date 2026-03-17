/**
 * Fond type Vamos : bleu clair apaisant + vagues bleu très pâle.
 */
export function VamosStyleBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#dbeef9]"
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "linear-gradient(165deg, #e8f4fc 0%, #dbeef9 35%, #d4e9f7 70%, #cfe5f5 100%)",
        }}
      />
      <svg
        className="absolute -left-[5%] top-0 h-[42%] w-[110%] text-white"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="vbWave1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(255 255 255)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="rgb(219 238 249)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          fill="url(#vbWave1)"
          d="M0,0 L1440,0 L1440,100 Q960,220 480,140 Q240,100 0,180 Z"
        />
      </svg>
      <svg
        className="absolute right-0 top-[15%] h-[38%] w-[95%] text-sky-100"
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          fillOpacity={0.35}
          d="M0,60 C400,180 800,-20 1440,100 L1440,280 L0,280 Z"
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 h-[45%] w-full text-white"
        viewBox="0 0 1440 360"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          fillOpacity={0.25}
          d="M0,120 C480,40 960,200 1440,80 L1440,360 L0,360 Z"
        />
      </svg>
      <div
        className="absolute bottom-[10%] right-[5%] h-64 w-64 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgb(255 255 255) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}
