import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/supabaseConfig';
import Navbar from './Navbar';
import { Trophy } from 'lucide-react'; 

const DifficultySelector = () => {
  const { quizType } = useParams();
  const [difficulties, setDifficulties] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchDifficulties = async () => {
      try {
        console.log(quizType)
        const { data, error } = await supabase
          .from('quizzes')
          .select('id, difficulty, xp_value, title, description, icon') 
          .eq('category', quizType); 

        if (error) throw error;

        const formattedDifficulties = data.map((quiz) => ({
          quizId: quiz.id,
          level: quiz.difficulty,
          title: quiz.title,
          description: quiz.description,
          questions: 'Questions: Varies',
          time: `XP: ${quiz.xp_value} points`,
          xp_value: quiz.xp_value,
          icon: quiz.icon,
        }));

        setDifficulties(formattedDifficulties);
      } catch (error) {
        console.error('Error fetching difficulties:', error.message);
      }
    };

    fetchDifficulties();
  }, [quizType]); 

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'trophy-green':
        return <Trophy className="w-8 h-8 text-green-500" />;
      case 'trophy-yellow':
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 'trophy-red':
        return <Trophy className="w-8 h-8 text-red-500" />;
      default:
        return null;
    }
  };

  const startQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`); 
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-heading-lg font-bold text-text mb-4">Select {quizType} Difficulty</h1>
          <p className="text-text text-base">Choose the difficulty level that matches your expertise</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {difficulties.map((difficulty) => (
            <div 
              key={difficulty.quizId} 
              className="card hover:shadow-md hover:scale-105 transition-all cursor-pointer "
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-heading-md font-semibold text-text">{difficulty.level}</h2>
                {getIcon(difficulty.icon)}
              </div>
              <p className="text-text mb-6">{difficulty.title}</p>
              <p className="text-text mb-6">{difficulty.description}</p>

              <div className="space-y-2">
                <div className="flex items-center text-text">
                  <span className="text-sm">{difficulty.questions}</span>
                </div>
                <div className="flex items-center text-text">
                  <span className="text-sm">{difficulty.time}</span>
                </div>
              </div>

              <button 
                className="button w-full mt-6"
                onClick={() => startQuiz(difficulty.quizId)}
              >
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DifficultySelector;
