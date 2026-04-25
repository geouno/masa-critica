export function ProgressBar({ current, target }: { current: bigint; target: bigint }) {
  const pct = target > 0n ? Number((current * 100n) / target) : 0;
  return (
    <div className="progress-container">
      <div className="progress-bar-track large">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="progress-label">{Math.min(pct, 100)}% consolidado</div>
    </div>
  );
}
