"use client";

export default function WaveformAnimation() {
    return (
        <div className="flex items-center gap-1.5 h-12">
            {[0, 1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="w-1.5 bg-accent rounded-full animate-waveform"
                    style={{
                        height: "100%",
                        animationDelay: `${i * 0.15}s`,
                    }}
                />
            ))}
            <style jsx>{`
        @keyframes waveform {
          0%, 100% { transform: scaleY(0.3); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        .animate-waveform {
          animation: waveform 1s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>
        </div>
    );
}
