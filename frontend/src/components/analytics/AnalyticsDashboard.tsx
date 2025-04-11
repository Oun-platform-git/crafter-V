import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { config } from '../../config/api';

interface AnalyticsData {
  videoStats: {
    totalVideos: number;
    totalDuration: number;
    averageDuration: number;
    popularCategories: { name: string; count: number }[];
  };
  engagementMetrics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    retention: number;
  };
  performanceData: {
    processingTime: number[];
    errorRate: number;
    successRate: number;
    qualityScore: number;
  };
  aiMetrics: {
    generationSuccess: number;
    averageGenerationTime: number;
    popularPrompts: { prompt: string; count: number }[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/analytics/dashboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box p={3}>
        <Typography color="error">Error: {error || 'No data available'}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Videos
              </Typography>
              <Typography variant="h3">{data.videoStats.totalVideos}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Views
              </Typography>
              <Typography variant="h3">{data.engagementMetrics.views}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Success Rate
              </Typography>
              <Box position="relative" display="inline-flex">
                <CircularProgress
                  variant="determinate"
                  value={data.performanceData.successRate}
                  size={80}
                />
                <Box
                  position="absolute"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                >
                  <Typography variant="caption" component="div" color="text.secondary">
                    {`${Math.round(data.performanceData.successRate)}%`}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Generation
              </Typography>
              <Typography variant="h3">{data.aiMetrics.generationSuccess}</Typography>
              <Typography variant="caption" color="text.secondary">
                Successful Generations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Video Categories
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.videoStats.popularCategories}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.videoStats.popularCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Processing Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.performanceData.processingTime.map((time, index) => ({
                name: `Day ${index + 1}`,
                time
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="time" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Popular AI Prompts
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.aiMetrics.popularPrompts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="prompt" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Engagement Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Engagement Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2">Likes</Typography>
                <LinearProgress
                  variant="determinate"
                  value={(data.engagementMetrics.likes / data.engagementMetrics.views) * 100}
                />
                <Typography variant="body2">{data.engagementMetrics.likes}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2">Shares</Typography>
                <LinearProgress
                  variant="determinate"
                  value={(data.engagementMetrics.shares / data.engagementMetrics.views) * 100}
                />
                <Typography variant="body2">{data.engagementMetrics.shares}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2">Comments</Typography>
                <LinearProgress
                  variant="determinate"
                  value={(data.engagementMetrics.comments / data.engagementMetrics.views) * 100}
                />
                <Typography variant="body2">{data.engagementMetrics.comments}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2">Retention</Typography>
                <LinearProgress
                  variant="determinate"
                  value={data.engagementMetrics.retention}
                />
                <Typography variant="body2">{`${data.engagementMetrics.retention}%`}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
