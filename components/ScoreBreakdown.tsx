import { ScoreResult } from '@/lib/scoring';

export function ScoreBreakdown({ score }: { score: ScoreResult }) {
  return (
    <div className="card">
      <h3>Score Breakdown</h3>
      <div className="list">
        {score.breakdown.map((item) => (
          <div key={item.label} className="list-item tooltip">
            <div>
              <div>{item.label}</div>
              <div className="score-label">{item.note}</div>
            </div>
            <div>
              <span className="tag">
                {item.points}/{item.max}
              </span>
            </div>
            <div className="tooltip-content">
              {item.label} contributes {item.points} of {item.max} points. {item.note}.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
