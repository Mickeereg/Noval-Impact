import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import { GiLaurelCrown } from 'react-icons/gi';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/users/leaderboard');
        setLeaderboardData(response.data.slice(0, 10)); // Top 10 users
        setLoading(false);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard data');
        setLoading(false);
      }
    };

    fetchLeaderboard();
    
    // Refresh leaderboard every minute
    const intervalId = setInterval(fetchLeaderboard, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Get badge for top 3 positions
  const getBadge = (position) => {
    switch (position) {
      case 0:
        return <GiLaurelCrown className="text-yellow-400 text-xl md:text-2xl" title="1st Place" />;
      case 1:
        return <FaTrophy className="text-gray-400 text-lg md:text-xl" title="2nd Place" />;
      case 2:
        return <FaMedal className="text-amber-600 text-lg md:text-xl" title="3rd Place" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 md:p-4 w-full">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-white">Top Recyclers</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <div className="space-y-2">
          {leaderboardData.length === 0 ? (
            <div className="text-gray-400 text-center py-4">No data available yet</div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-300 text-xs md:text-sm">
                    <th className="py-2 px-2 md:px-3">Rank</th>
                    <th className="py-2 px-2 md:px-3">User</th>
                    <th className="py-2 px-2 md:px-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((user, index) => (
                    <tr 
                      key={user._id} 
                      className={`text-xs md:text-sm border-t border-gray-700/50 
                        ${index < 3 ? 'bg-emerald-900/30' : ''}`}
                    >
                      <td className="py-2 px-2 md:px-3 flex items-center">
                        <span className="w-5 md:w-6 inline-flex justify-center">{index + 1}</span>
                        {getBadge(index)}
                      </td>
                      <td className="py-2 px-2 md:px-3 font-medium truncate max-w-[100px] md:max-w-[150px]">
                        {user.name || 'Anonymous'}
                      </td>
                      <td className="py-2 px-2 md:px-3 text-right font-bold text-emerald-400">
                        {user.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="pt-2 text-xs md:text-sm text-gray-400 text-center border-t border-gray-700/50">
            Updated every minute
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard; 