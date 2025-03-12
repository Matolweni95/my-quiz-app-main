import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Zap } from 'lucide-react';
import Card from '../ui/Card'; 
import CardContent from '../ui/CardContent';
import CardDescription from '../ui/CardDescription';
import CardFooter from '../ui/CardFooter';
import CardHeader from '../ui/CardHeader';
import CardTitle from '../ui/CardTitle';
import Button from '../ui/Button';
import Input from '../ui/Input';

const QuizResults = ({ correctAnswers, totalQuestions, xpValue }) => {
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const retake = () => {
    window.location.reload();
  };

  // Calculate final percentage and XP 
  const finalPercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const calculatedXp =
    finalPercentage >= 100
      ? xpValue
      : finalPercentage >= 70
      ? Math.round(xpValue * 0.8)
      : Math.max(Math.round(xpValue * (finalPercentage / 100)), 10); 

  useEffect(() => {
    setIsAnimating(true);
    let currentScore = 0;
    let currentXp = 0;
    
    const scoreInterval = setInterval(() => {
      if (currentScore < finalPercentage) {
        currentScore += 1;
        setScore(currentScore);
      } else {
        clearInterval(scoreInterval);
      }
    }, 20);

    const xpInterval = setInterval(() => {
      if (currentXp < calculatedXp) {
        currentXp += 2;
        setXp(currentXp);
      } else {
        clearInterval(xpInterval);
        setTimeout(() => setIsAnimating(false), 500);
      }
    }, 20);

    return () => {
      clearInterval(scoreInterval);
      clearInterval(xpInterval);
    };
  }, [finalPercentage, calculatedXp]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-4">
      <div className={`transform transition-transform duration-500 ${
        isAnimating ? 'scale-110' : 'scale-100'
      }`}>
        <Trophy size={64} className="text-yellow-500 mb-4" />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 text-[--default]">{score}%</div>
              <div className="text-gray-500">Final Score</div>
            </div>

            <div className="flex items-center justify-center space-x-2 bg-blue-50 p-4 rounded-lg">
              <Zap className="text-blue-500" />
              <div className="text-2xl font-bold text-blue-500">
                +{xp} XP
              </div>
            </div>

            <div className="text-center text-gray-600">
              {xp >= 150
                ? "Excellent work! You've mastered this topic!"
                : xp >= 100
                ? "Great job! Keep up the good work!"
                : "Good effort! Practice makes perfect!"}
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={retake} 
                className="w-full p-4 bg-primary hover:bg-purple/90 transition-colors rounded-lg text-white"
              >
                Re-take Quiz
              </button>
              
              <Link to="/" className="w-full">
                <button className="w-full text-center p-4 bg-primary hover:bg-purple/90 transition-colors rounded-lg text-white">
                  Take Another Quiz
                </button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResults;
