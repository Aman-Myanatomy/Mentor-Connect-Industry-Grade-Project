import { useCountUp } from '../hooks/use-count-up';

// Match score as a labelled bar that fills up and counts up (the number is always printed too, never colour alone).
export const ScoreMeter = ({ score }) => {
  const shown = useCountUp(score);
  return (
    <div className="score" role="img" aria-label={`Match score ${score} out of 100`}>
      <div className="score-track">
        <div className="score-fill" style={{ '--to': Math.max(0.03, score / 100) }} />
      </div>
      <span className="score-num">{shown}</span>
    </div>
  );
};
