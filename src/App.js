import './App.css';
import Home from './components/js/Home';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Quiz from './components/js/Quiz';
import { AuthProvider } from './contexts/AuthContext';
import AuthPage, { Login } from './components/js/Auth';
import  {useAuth}  from './contexts/AuthContext';
import Dashboard from './components/js/Dashboard';
import DifficultySelector from './components/js/DifficultySelector'; 
import Leaderboard from './components/js/Leaderboard';
import DashboardLayout from './layouts/Dashboardlayout';

// Protected Route Component
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="leaderboard" element={<Leaderboard />} /> 
              {/* <Route path="statistics" element={<Statistics />} /> */}
            </Route>

            <Route
              path="/difficulty/:quizType"
              element={<DifficultySelector quiz />} 
            />

            <Route
              path="/quiz/:quizId" 
              element={
                <PrivateRoute>
                  <Quiz /> 
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
