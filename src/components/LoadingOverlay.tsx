type Props = {
  label?: string;
};

const ORBIT_ANGLES = [0, 72, 144, 216, 288] as const;

export default function LoadingOverlay({ label = "ロード中" }: Props) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/25 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div className="relative size-24">
        <div className="loading-orbit absolute inset-0">
          {ORBIT_ANGLES.map((angle) => (
            <span
              key={angle}
              className="loading-orbit-dot absolute left-1/2 top-1/2 size-2.5 rounded-full bg-emerald-600"
              style={{ ["--orbit-angle" as string]: `${angle}deg` }}
            />
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-bold tracking-wide text-stone-700">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
