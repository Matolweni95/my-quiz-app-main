import { useState } from 'react';
import Card from '../ui/Card';
import CardContent from '../ui/CardContent';
import CardDescription from '../ui/CardDescription';
import CardFooter from '../ui/CardFooter';
import CardHeader from '../ui/CardHeader';
import CardTitle from '../ui/CardTitle';
import Button from '../ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('You closed the authentication popup before completing the login.');
      } else {
        setError('An error occurred during authentication. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen flex flex-col items-center justify-center bg-[--background] p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 flex items-center text-[--primary] hover:text-[--primary] hover:bg-[--card]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          </Link>
        </div>

        <Card className="w-full bg-[--card]">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-[--text]">
              Welcome
            </CardTitle>
            <CardDescription className="text-center">
              Sign in with your Google account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            <Button
              className="w-full bg-primary hover:bg-primary-700 text-[--text]"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? "Processing..." : "Continue with Google"}
            </Button>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
    </>
  );
};

export default AuthPage;