import { useEffect, useState } from "react";

interface ScoreCircleProps {
  score: number;
  size?: number;
  thickness?: number;
  animationDuration?: number;
}

export function ScoreCircle({ 
  score, 
  size = 120, 
  thickness = 12,
  animationDuration = 1500 
}: ScoreCircleProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = size / 2 - thickness / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(142, 76%, 36%)'; // Emerald (green)
    if (score >= 60) return 'hsl(38, 92%, 50%)';  // Amber (yellow)
    return 'hsl(350, 89%, 60%)';                  // Rose (red)
  };

  useEffect(() => {
    // Reset to 0 if score changes
    setDisplayScore(0);
    
    // Animate the score
    const stepDuration = animationDuration / score;
    const timer = setInterval(() => {
      setDisplayScore(prevScore => {
        const nextScore = prevScore + 1;
        if (nextScore >= score) {
          clearInterval(timer);
          return score;
        }
        return nextScore;
      });
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [score, animationDuration]);

  const strokeDashoffset = circumference - (displayScore / 100) * circumference;
  const scoreColor = getScoreColor(score);

  return (
    <div className="score-circle relative" style={{ height: size, width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          fill="none" 
          stroke="#E5E7EB" 
          strokeWidth={thickness} 
        />
        {/* Progress circle */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          fill="none" 
          stroke={scoreColor} 
          strokeWidth={thickness} 
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset} 
          style={{ 
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.5s ease'
          }} 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{displayScore}</span>
      </div>
    </div>
  );
}
