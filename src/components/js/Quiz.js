import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabase/supabaseConfig';
import CryptoJS from 'crypto-js';
import Navbar from './Navbar';
import QuizResults from '../js/QuizResults';
import QuizLoader from './QuizLoader';

const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY;

function Quiz() {
  const { quizId } = useParams();
  const [questionsData, setQuestionsData] = useState([]);
  const [quizXP, setQuizXP] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userSelections, setUserSelections] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(null);
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [encryptedUserId, setEncryptedUserId] = useState('');

  useEffect(() => {
    const encrypted = localStorage.getItem('firebase_uid');
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decryptedUserId = bytes.toString(CryptoJS.enc.Utf8);
    setEncryptedUserId(decryptedUserId);
    console.log(encryptedUserId)

  
  }, []);

  useEffect(() => {
    const fetchQuizData = async () => {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('xp_value')
        .eq('id', quizId)
        .single();

      if (quizError) {
        console.error('Error fetching quiz XP:', quizError);
      } else {
        setQuizXP(quizData.xp_value);
      }

      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId);

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
      } else {
        const transformedData = questions.map((question) => ({
          ...question,
          options: [question.option1, question.option2, question.option3, question.option4],
          correctAnswer: question.correct_answer,
        }));
        setQuestionsData(transformedData);
        setUserSelections(Array(transformedData.length).fill(''));
      }

      setLoading(false);
    };

    fetchQuizData();
  }, [quizId]);

  const handleOptionSelect = (option) => {
    const updatedSelections = [...userSelections];
    updatedSelections[currentQuestion] = option;
    setUserSelections(updatedSelections);
    setIsNextButtonDisabled(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questionsData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsNextButtonDisabled(true);
    }
  };

  const handleQuizCompletion = async () => {
    const newCorrectAnswers = questionsData.reduce(
      (acc, question, index) => (userSelections[index] === question.correctAnswer ? acc + 1 : acc),
      0
    );
    setCorrectAnswers(newCorrectAnswers);

    const xpEarned = calculateXp(newCorrectAnswers);

    // Log the data you're sending
    console.log('Inserting user progress:', {
      user_id: encryptedUserId,
      quiz_id: quizId,
      score: newCorrectAnswers,
      xp_earned: xpEarned,
    });

    const { error: progressError } = await supabase
      .from('user_progress')
      .insert([
        {
          user_id: encryptedUserId,
          quiz_id: quizId,
          score: newCorrectAnswers,
          xp_earned: xpEarned,
        }
      ]);

    if (progressError) {
      console.error('Error inserting progress data:', progressError);
      return;
    }

   // Fetch current total XP from the leaderboard
const { data: currentLeaderboardData, error: leaderboardFetchError } = await supabase
.from('leaderboard')
.select('total_xp')
.eq('user_id', encryptedUserId);

// Check if we got data (and handle the array properly)
let currentXP = 0;
if (!leaderboardFetchError && currentLeaderboardData && currentLeaderboardData.length > 0) {
currentXP = currentLeaderboardData[0].total_xp || 0;
}

// Calculate the updated XP
const updatedTotalXP = currentXP + xpEarned;

// Rest of your code remains the same
console.log('Upserting leaderboard data:', {
user_id: encryptedUserId,
total_xp: updatedTotalXP,
});

// Update or insert leaderboard data
const { error: leaderboardError } = await supabase
.from('leaderboard')
.upsert([
  {
    user_id: encryptedUserId,
    total_xp: updatedTotalXP,
  }
], { onConflict: 'user_id' });

    // Log the data for user attempt
    console.log('Inserting user attempt data:', {
      user_id: encryptedUserId,
      quiz_id: quizId,
      attempt_number: 1,
      attempted_at: new Date().toISOString(),
      score: newCorrectAnswers,
    });

    const { error: attemptError } = await supabase
      .from('user_attempts')
      .insert([
        {
          user_id: encryptedUserId,
          quiz_id: quizId,
          attempt_number: 1,
          attempted_at: new Date().toISOString(),
          score: newCorrectAnswers,
        }
      ]);

    if (attemptError) {
      console.error('Error inserting attempt data:', attemptError);
      return;
    }

    const { data: streakData, error: streakError } = await supabase
    .from('streaks')
    .select('current_streak, last_completed')
    .eq('user_id', encryptedUserId)
    .single();

    if (streakError && streakError.code !== 'PGRST116') {
      console.error('Error fetching streak data:', streakError);
      return;
    }

    const today = new Date();
    let updatedStreak = 1;

  if (streakData) {
    const lastCompleted = new Date(streakData.last_completed);
    const diffInTime = today.getTime() - lastCompleted.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24);

    // Streak incrementer
    if (diffInDays === 1) {
      updatedStreak = streakData.current_streak + 1;
    } else if (diffInDays > 1) {
      updatedStreak = 1;
    }
  }

  console.log('Updating streak data:', {
    user_id: encryptedUserId,
    current_streak: updatedStreak,
    last_completed: today.toISOString().split('T')[0],
  });

  // Update or insert streak data
  const { error: streakUpdateError } = await supabase
    .from('streaks')
    .upsert([
      {
        user_id: encryptedUserId,
        current_streak: updatedStreak,
        last_completed: today.toISOString().split('T')[0], 
      }
    ], { onConflict: ['user_id'] });

  if (streakUpdateError) {
      console.error('Error updating streak data:', streakUpdateError);
    return;
  }

    console.log('Quiz completion handled successfully.');
  };


  const calculateXp = (correctAnswers) => {
    const totalQuestions = questionsData.length;
    if (correctAnswers === totalQuestions) return quizXP;
    if (correctAnswers >= totalQuestions * 0.7) return Math.max(Math.floor(quizXP * 0.8), 10); 
    if (correctAnswers >= totalQuestions * 0.5) return Math.max(Math.floor(quizXP * 0.5), 10); 
    return 10; 
  };

  const progress = ((currentQuestion + 1) / questionsData.length) * 100;

  if (loading) {
    return <QuizLoader />;
  }

  return (
    <div>
      <Navbar />
      <div className='text-[--text] quiz__container flex flex-col p-8 md:flex-row items-center justify-around'>
        {correctAnswers !== null ? (
          <QuizResults 
            correctAnswers={correctAnswers} 
            totalQuestions={questionsData.length} 
            xpValue={quizXP}
          />
        ) : (
          <>
            <div className='quiz__question text-center md:text-left mb-8 md:mb-0 md:mr-10'>
              <h2 className='text-1xl md:text-1xl'>Question {currentQuestion + 1} of {questionsData.length}</h2>
              <p className='mt-2 text-3xl md:w-3/4'>{questionsData[currentQuestion].question_text}</p>
              <div className='mt-4'>
                <progress className='rounded-full w-1/2' value={progress} max='100' />
                <p className='text-sm'>Progress: {progress}%</p>
              </div>
            </div>
            <div className='flex flex-col gap-4 w-full md:w-1/2'>
              {questionsData[currentQuestion].options.map((option, index) => (
                <div
                  key={index}
                  className={`card flex items-center ${
                    userSelections[currentQuestion] === option ? 'bg-purple' : 'bg-[--card]'
                  } text-[--text] rounded-lg shadow-md p-4 md:p-8 mb-4 md:mb-0 w-full cursor-pointer`}
                  onClick={() => handleOptionSelect(option)}
                >
                  <label htmlFor={`option${index}`} className='cursor-pointer'>
                    {option}
                  </label>
                </div>
              ))}
              <button
                className={`w-full text-center p-4 md:p-7 mt-4 bg-primary rounded-lg transition-opacity ${
                  isNextButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                }`}
                onClick={currentQuestion < questionsData.length - 1 ? handleNextQuestion : handleQuizCompletion}
                disabled={isNextButtonDisabled}
              >
                {currentQuestion < questionsData.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Quiz;
