export default function HomeGradientBackground({ className = '' }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <style>
        {`
          @keyframes home-wave-drift-a {
            0% { transform: translate3d(-8%, 0, 0) scaleX(1.02); opacity: 0.38; }
            50% { transform: translate3d(4%, -2%, 0) scaleX(1.06); opacity: 0.62; }
            100% { transform: translate3d(-8%, 0, 0) scaleX(1.02); opacity: 0.38; }
          }

          @keyframes home-wave-drift-b {
            0% { transform: translate3d(6%, 0, 0) scaleX(1); opacity: 0.24; }
            50% { transform: translate3d(-6%, 2%, 0) scaleX(1.04); opacity: 0.46; }
            100% { transform: translate3d(6%, 0, 0) scaleX(1); opacity: 0.24; }
          }

          @keyframes home-glow-drift {
            0% { transform: translate3d(0, 0, 0) scale(1); }
            50% { transform: translate3d(3%, -2%, 0) scale(1.08); }
            100% { transform: translate3d(0, 0, 0) scale(1); }
          }
        `}
      </style>

      {/* Base escura em degradê para manter contraste com o conteúdo da home. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #060a0f 0%, #0b1320 34%, #101b29 68%, #0a1018 100%)',
        }}
      />

      {/* Glows da marca puxando para o tom #31B0A9. */}
      <div
        className="absolute -top-24 left-[-12%] h-[34rem] w-[34rem] rounded-full blur-3xl opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(49,176,169,0.34) 0%, rgba(49,176,169,0.10) 42%, transparent 74%)',
          animation: 'home-glow-drift 16s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-[28%] right-[-10%] h-[30rem] w-[30rem] rounded-full blur-3xl opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(49,176,169,0.26) 0%, rgba(49,176,169,0.08) 40%, transparent 72%)',
          animation: 'home-glow-drift 20s ease-in-out infinite reverse',
        }}
      />

      {/* Grade sutil para reforçar a linguagem tech sem pesar visualmente. */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.95), rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.95))',
        }}
      />

      {/* Ondas modernas e sutis em SVG para dar movimento contínuo ao fundo. */}
      <div
        className="absolute left-[-10%] top-[8%] w-[125%] opacity-50 blur-[1px]"
        style={{ animation: 'home-wave-drift-a 18s ease-in-out infinite' }}
      >
        <svg viewBox="0 0 1600 320" className="h-56 w-full">
          <path
            d="M0,160 C180,98 310,220 500,178 C690,136 760,42 940,62 C1120,82 1220,198 1400,176 C1508,162 1560,116 1600,92"
            fill="none"
            stroke="rgba(49,176,169,0.38)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M0,210 C210,178 290,268 470,236 C650,204 780,118 970,140 C1160,162 1250,248 1430,234 C1528,226 1570,196 1600,184"
            fill="none"
            stroke="rgba(120,255,240,0.20)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div
        className="absolute left-[-8%] top-[42%] w-[120%] opacity-40 blur-[1px]"
        style={{ animation: 'home-wave-drift-b 22s ease-in-out infinite' }}
      >
        <svg viewBox="0 0 1600 320" className="h-52 w-full">
          <path
            d="M0,124 C150,148 248,228 432,220 C616,212 744,106 914,108 C1084,110 1190,216 1376,228 C1490,236 1556,208 1600,176"
            fill="none"
            stroke="rgba(49,176,169,0.30)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M0,190 C126,170 242,120 412,142 C582,164 694,248 872,244 C1050,240 1188,150 1376,152 C1488,154 1558,174 1600,196"
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div
        className="absolute left-[-12%] bottom-[-2%] w-[128%] opacity-35 blur-[2px]"
        style={{ animation: 'home-wave-drift-a 26s ease-in-out infinite reverse' }}
      >
        <svg viewBox="0 0 1600 320" className="h-64 w-full">
          <path
            d="M0,110 C188,48 292,188 484,182 C676,176 770,70 954,70 C1138,70 1228,176 1418,192 C1518,200 1570,180 1600,160"
            fill="none"
            stroke="rgba(49,176,169,0.22)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Vinheta final para preservar a leitura no centro da página. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 28%, rgba(3,6,10,0.28) 68%, rgba(2,4,8,0.62) 100%)',
        }}
      />
    </div>
  );
}
