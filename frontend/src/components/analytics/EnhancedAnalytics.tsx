import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Cell, ResponsiveContainer
} from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { MetricCard } from './MetricCard';
import { TrendIndicator } from './TrendIndicator';
import { DateRangePicker } from './DateRangePicker';

interface AnalyticsData {
  videoStats: any;
  engagementMetrics: any;
  aiMetrics: any;
}

export const EnhancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { getDashboardData, exportAnalytics } = useAnalytics();

  useEffect(() => {
    fetchData();
  }, [timeRange, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const analyticsData = await getDashboardData({
        timeRange,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      await exportAnalytics({
        format,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  if (!data) return null;

  const { videoStats, engagementMetrics, aiMetrics } = data;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Analytics Dashboard</Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>

          {timeRange === 'custom' && (
            <DateRangePicker
              startDate={dateRange.start}
              endDate={dateRange.end}
              onChange={setDateRange}
            />
          )}

          <Button
            variant="outlined"
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Video Performance Metrics */}
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Total Videos"
            value={videoStats.totalVideos}
            trend={videoStats.trend}
            icon="video"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Total Views"
            value={engagementMetrics.views}
            trend={engagementMetrics.viewsTrend}
            icon="visibility"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Avg. Retention"
            value={`${engagementMetrics.retention}%`}
            trend={engagementMetrics.retentionTrend}
            icon="timer"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="AI Generations"
            value={aiMetrics.totalGenerations}
            trend={aiMetrics.generationsTrend}
            icon="smart_toy"
          />
        </Grid>

        {/* Engagement Over Time */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Engagement Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementMetrics.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#8884d8" />
                <Line type="monotone" dataKey="likes" stroke="#82ca9d" />
                <Line type="monotone" dataKey="shares" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Popular Categories */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Popular Categories
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={videoStats.popularCategories}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {videoStats.popularCategories.map((entry: any, index: number) => (
                    <Cell key={index} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* AI Performance */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              AI Generation Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aiMetrics.performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="successful" fill="#82ca9d" />
                <Bar dataKey="failed" fill="#ff8042" />
                <Bar dataKey="processing" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
