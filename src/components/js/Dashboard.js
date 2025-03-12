import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, Book, BarChart2, Settings, Sun, Moon, Menu, X, Target, Clock, Award, Bell, User , TrendingUp} from "lucide-react";
import { supabase } from "../../supabase/supabaseConfig";
import CryptoJS from "crypto-js";
import DashboardLoader from "./DashboardLoader";

const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY;

const Dashboard = () => {

const MetricCard = ({ title, value, icon: Icon, color = "text-primary" }) => (
  <div className="bg-background-card p-6 rounded-lg border border-border">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-text-secondary">{title}</h3>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <p className="text-4xl font-bold">{value}</p>
  </div>
);

const RecentQuizzes = ({ quizzes }) => (
  <div className="bg-background-card p-6 rounded-lg border border-border">
    <h2 className="text-xl font-semibold mb-6">Recent Quizzes</h2>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-text-secondary">
            <th className="text-left pb-4">Quiz Name</th>
            <th className="text-left pb-4">Score</th>
            <th className="text-left pb-4">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {quizzes.map((quiz, index) => (
            <tr key={index}>
              <td className="py-4">{quiz.title}</td>
              <td className="py-4">{quiz.score}%</td>
              <td className="py-4">{quiz.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);


  const [isDarkMode, setIsDarkMode] = useState(false);
  const [username, setUsername] = useState("");
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [encryptedUserId, setEncryptedUserId] = useState('');
  const [averageScore, setAverageScore] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const [recentQuizzes, setRecentQuizzes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const encrypted = localStorage.getItem('firebase_uid');
        const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
        const decryptedUserId = bytes.toString(CryptoJS.enc.Utf8);
        setEncryptedUserId(decryptedUserId);

        // Fetch user details
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("username")
          .eq("id", decryptedUserId)
          .single();
        
        if (userError) throw userError;
        setUsername(user.username);

        // Fetch total XP
        const { data: leaderboard, error: xpError } = await supabase
          .from("leaderboard")
          .select("total_xp")
          .eq("user_id", decryptedUserId)
          .single();

        if (xpError) throw xpError;
        setTotalXP(leaderboard?.total_xp || 0);

        // Fetch streak
        const { data: streakData, error: streakError } = await supabase
          .from("streaks")
          .select("current_streak")
          .eq("user_id", decryptedUserId)
          .single();

        if (streakError) throw streakError;
        setStreak(streakData?.current_streak || 0);

        // Fetch user progress to calculate average score and highest score
        const { data: progressData, error: progressError } = await supabase
          .from("user_progress")
          .select("score, quiz_id, completed_at")
          .eq("user_id", decryptedUserId)
          .order("completed_at", { ascending: false });

        if (progressError) throw progressError;

        const totalScores = progressData.reduce((acc, item) => acc + (item.score / 10) * 100, 0);
        const highest = Math.max(...progressData.map(item => (item.score / 10) * 100)); 
        setAverageScore(Math.round((totalScores / progressData.length) || 0));
        setHighestScore(highest);

        // Format recent quizzes
        const quizzes = await Promise.all(
          progressData.slice(0, 5).map(async (progress) => {
            const { data: quiz } = await supabase
              .from("quizzes")
              .select("title")
              .eq("id", progress.quiz_id)
              .single();
            return {
              title: quiz?.title || "Unknown Quiz",
              score: Math.round((progress.score / 10) * 100), 
              date: new Date(progress.completed_at).toLocaleDateString(),
            };
          })
        );

        setRecentQuizzes(quizzes);

      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <DashboardLoader />;
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
  };

  return (
    <div className="flex min-h-screen bg-background">
    
      <main className="flex-1">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <div className="text-text-secondary">{username}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 pb-8">
            <MetricCard
              title="Total XP"
              value={totalXP}
              icon={Award}
              color="text-yellow-500"
            />
            <MetricCard
              title="Streak"
              value={streak}
              icon={Clock}
              color="text-green-500"
            />
            <MetricCard
              title="Average Score"
              value={`${averageScore}%`}
              icon={Target}
              color="text-blue-500"
            />
            <MetricCard
              title="Highest Score"
              value={`${highestScore}%`}
              icon={Bell}
              color="text-red-500"
            />
          </div>
          
          <RecentQuizzes quizzes={recentQuizzes} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
