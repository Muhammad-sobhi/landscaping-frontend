import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useDashboard() {
  const [stats, setStats] = useState({});
  const [operations, setOperations] = useState({ 
    recent_jobs: [], 
    todays_schedule: [], 
    todo_list: 0 
  });
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      // 1. Get Financial Data from AnalyticsController
      const statsRes = await api.get('/analytics/stats');
      setStats(statsRes.data);

      // 2. Get Operational Data from DashboardController
      const opsRes = await api.get('/dashboard/operations');
      setOperations(opsRes.data);
    } catch (err) {
      console.error("Sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return { stats, operations, loading, refreshData };
}