import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import { faBrush } from '@fortawesome/free-solid-svg-icons';
import { faSquareJs } from '@fortawesome/free-brands-svg-icons';
import { useAuth } from '../../contexts/AuthContext';

function Landing() {
  const { user } = useAuth();

  return (
    <div className='landing flex flex-col items-center justify-center min-h-screen'>
      <div className='landing__container text-[--text] flex flex-col md:flex-row justify-around items-center p-8 md:p-16 w-full mx-auto'>
        <div className='text-center md:text-left md:mr-10 flex flex-col gap-3'>
          <h1 className='text-5xl font-bold'>Welcome to the Quiz</h1>
          <h2 className='text-5xl'>Frontend Quiz!</h2>
          <p className='text-lg mt-5'>Pick a subject to get started</p>
          
          {!user && (
            <p className="text-[--text] mt-4">Please log in to save your progress</p>
          )}
        </div>

        <div className='flex flex-col gap-6 justify-center mt-7 w-full md:w-1/2'>
          <Link to="/difficulty/HTML">
            <div className='card bg-[--card] flex items-center bg-blue-500 text-white rounded-lg shadow-md p-8 mb-6 md:mb-0 w-full'>
              <FontAwesomeIcon icon={faCode} size="2x" className='pr-7'/>
              <h1 className='text-xl md:text-2xl'>HTML</h1>
            </div>
          </Link>
          <Link to="/difficulty/CSS">
            <div className='card bg-[--card] flex items-center bg-green-500 text-white rounded-lg shadow-md p-8 mb-6 md:mb-0 w-full'>
              <FontAwesomeIcon icon={faBrush} size="3x" className='pr-8' />
              <h1 className='text-xl md:text-2xl'>CSS</h1>
            </div>
          </Link>
          <Link to="/difficulty/JavaScript">
            <div className='card bg-[--card] flex items-center bg-yellow-500 text-white rounded-lg shadow-md p-8 w-full'>
              <FontAwesomeIcon icon={faSquareJs} size="3x" className='pr-7'/>
              <h1 className='text-xl md:text-2xl'>JavaScript</h1>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Landing;