import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Medal, History, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../supabase/supabaseConfig';
import Card from '../ui/Card';
import CardContent from '../ui/CardContent';
import CardHeader from '../ui/CardHeader';
import CardTitle from '../ui/CardTitle';

const Leaderboard = () => {
  const [currentLeaderboard, setCurrentLeaderboard] = useState([]);
  const [previousLeaderboard, setPreviousLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const autoRefreshIntervalRef = useRef(null);
  const refreshIntervalMs = 30000; 

  useEffect(() => {
    // Initial data fetch
    fetchLeaderboardData();

    // Set up real-time subscription for leaderboard changes
    const leaderboardSubscription = supabase
      .channel('leaderboard-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leaderboard' }, 
        () => {
          console.log('Leaderboard data changed, refreshing...');
          fetchLeaderboardData(false);
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(leaderboardSubscription);
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, []);

  // Set up/tear down the auto-refresh interval when autoRefresh state changes
  useEffect(() => {
    if (autoRefresh) {
      autoRefreshIntervalRef.current = setInterval(() => {
        console.log('Auto-refreshing leaderboard...');
        fetchLeaderboardData(false);
      }, refreshIntervalMs);
    } else if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
      autoRefreshIntervalRef.current = null;
    }

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  const fetchLeaderboardData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;
      
      // Fetch current leaderboard (top 10 by total_xp)
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard')
        .select('user_id, total_xp')
        .order('total_xp', { ascending: false })
        .limit(10);

      if (leaderboardError) {
        console.error('Error fetching leaderboard:', leaderboardError);
        return;
      }

      // Fetch user data from users table
      const userIds = leaderboardData.map(item => item.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username')
        .in('id', userIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
      }

      // Create a map of users for easy lookup
      const usersMap = {};
      if (usersData) {
        usersData.forEach(user => {
          usersMap[user.id] = user;
        });
      }

      // Format current leaderboard data
      const formattedLeaderboard = leaderboardData.map((item, index) => {
        const user = usersMap[item.user_id];
        return {
          id: item.user_id,
          rank: index + 1,
          name: user?.username || 'Anonymous User',
          score: item.total_xp,
          isCurrentUser: item.user_id === currentUserId
        };
      });

      setCurrentLeaderboard(formattedLeaderboard);
      
      // Find current user's rank if they're not in top 10
      if (currentUserId && !formattedLeaderboard.some(item => item.id === currentUserId)) {
        const { data: userRankData, error: userRankError } = await supabase
          .from('leaderboard')
          .select('user_id, total_xp')
          .order('total_xp', { ascending: false });
          
        if (!userRankError && userRankData) {
          const userRankIndex = userRankData.findIndex(item => item.user_id === currentUserId);
          if (userRankIndex !== -1) {
            setCurrentUserRank({
              rank: userRankIndex + 1,
              score: userRankData[userRankIndex].total_xp
            });
          }
        }
      }

      // Fetch previous week's leaderboard data
      const { data: previousData, error: previousError } = await supabase
        .from('previous_leaderboard')
        .select('user_id, total_xp')
        .order('total_xp', { ascending: false })
        .limit(10);

      if (previousError) {
        console.error('Error fetching previous leaderboard:', previousError);
      } else if (previousData) {
        // Fetch users for previous leaderboard
        const prevUserIds = previousData.map(item => item.user_id);
        const { data: prevUsersData } = await supabase
          .from('users')
          .select('id, username')
          .in('id', prevUserIds);

        // Create users map for previous leaderboard
        const prevUsersMap = {};
        if (prevUsersData) {
          prevUsersData.forEach(user => {
            prevUsersMap[user.id] = user;
          });
        }

        // Format previous leaderboard data
        const formattedPreviousLeaderboard = previousData.map((item, index) => {
          const user = prevUsersMap[item.user_id];
          return {
            id: item.user_id,
            rank: index + 1,
            name: user?.username || 'Anonymous User',
            score: item.total_xp
          };
        });

        setPreviousLeaderboard(formattedPreviousLeaderboard);
      }
      
      // Update last refreshed timestamp
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error in leaderboard data fetch:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 md:w-6 md:h-6 text-amber-700" />;
      default:
        return <span className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center font-bold text-gray-500">{rank}</span>;
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl mx-auto p-4">
      {/* Current Leaderboard */}
      <Card className="flex-1 w-full">
        <CardHeader className="p-4 md:p-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl md:text-2xl font-bold">Current Rankings</CardTitle>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleAutoRefresh}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {autoRefresh ? 'Auto Refresh: On' : 'Auto Refresh: Off'}
              </button>
              <button
                onClick={() => fetchLeaderboardData(false)}
                disabled={refreshing}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <RefreshCw 
                  className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} 
                />
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">
            Last updated: {formatTime(lastRefreshed)}
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          {currentLeaderboard.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              <AnimatePresence>
                {currentLeaderboard.map((player) => (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ opacity: 1 }}
                    animate={{
                      opacity: 1,
                      backgroundColor: player.isCurrentUser ? '#f0f7ff' : '#f9fafb',
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      layout: { duration: 0.3 },
                      opacity: { duration: 0.2 }
                    }}
                    className="flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
                  >
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <motion.div layout className="flex-shrink-0">
                        {getRankIcon(player.rank)}
                      </motion.div>
                      <div>
                        <motion.div layout className={`font-semibold text-[--default] ${player.isCurrentUser}`}>
                          {player.name} {player.isCurrentUser ? '(You)' : ''}
                        </motion.div>
                        <motion.div layout className="text-xs md:text-sm text-gray-500">Rank #{player.rank}</motion.div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right">
                        <motion.div layout className="font-bold text-[--default]">
                          {player.score}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {currentUserRank && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-blue-50 text-sm md:text-base">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="flex-shrink-0">
                        <span className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center font-bold text-blue-500">
                          {currentUserRank.rank}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-600">Your Ranking</div>
                        <div className="text-xs md:text-sm text-gray-500">Rank #{currentUserRank.rank}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{currentUserRank.score}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No leaderboard data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Previous Week's Top 10 */}
      <Card className="w-full lg:w-80">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl font-bold text-center flex items-center justify-center gap-2">
            <History className="w-4 h-4 md:w-5 md:h-5" />
            Last Week's Top 10
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          {previousLeaderboard.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              {previousLeaderboard.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 text-xs md:text-sm font-semibold text-gray-500">#{player.rank}</span>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <span className="text-xs md:text-sm font-semibold">{player.score}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No historical data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;