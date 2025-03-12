import React from 'react';

const QuizLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
        <div className="relative w-24 h-24 animate-bounce">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-4 left-4 w-16 h-16 border-8 border-primary rounded-full animate-pulse"/>
            <div className="absolute top-2 left-12 w-8 h-8 border-4 border-secondary rounded-full animate-ping"/>
            <div className="absolute top-14 left-2 w-6 h-6 border-4 border-accent rounded-full animate-pulse"/>
          </div>
        </div>
        
        <div className="mt-8 text-xl font-bold text-text">
          <span className="inline-block animate-pulse">Loading Quiz</span>
          <span className="inline-block ml-1 animate-bounce delay-100">.</span>
          <span className="inline-block ml-1 animate-bounce delay-200">.</span>
          <span className="inline-block ml-1 animate-bounce delay-300">.</span>
        </div>

        <div className="w-48 h-2 mt-4 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent animate-shimmer"/>
        </div>
      </div>
    </div>
  );
};

export default QuizLoader;