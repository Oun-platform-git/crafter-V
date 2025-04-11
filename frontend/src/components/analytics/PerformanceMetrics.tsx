import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  BarChart,
  PieChart as PieChartIcon,
  MoreVert,
  Share,
  ThumbUp,
  Comment,
  Visibility,
  Schedule
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Scatter,
  Area
} from 'recharts';
import { useAIService } from '../../hooks/useAIService';

interface MetricData {
  timestamp: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  watchTime: number;
  retention: number;
  engagement: number;
}

interface AudienceSegment {
  name: string;
  value: number;
  growth: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const PerformanceMetrics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
  const { analyzeContent } = useAIService();

  useEffect(() => {
    fetchMetrics();
    fetchAudienceSegments();
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/analytics/metrics?range=${timeRange}`);
      const data = await response.json();
      setMetrics(data);
      
      // Get AI insights
      const insights = await analyzeContent('metrics');
      // Update visualizations based on insights
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setLoading(false);
    }
  };

  const fetchAudienceSegments = async () => {
    try {
      const response = await fetch('/api/analytics/segments');
      const data = await response.json();
      setSegments(data);
    } catch (error) {
      console.error('Error fetching segments:', error);
    }
  };

  const renderEngagementChart = () => (
    <Paper sx={{ p: 3, height: 400 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">
          Engagement Metrics
        </Typography>
        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
          <MoreVert />
        </IconButton>
      </Stack>
      
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={metrics}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <RechartsTooltip />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="views"
            fill="#8884d8"
            name="Views"
          />
          <Bar
            yAxisId="left"
            dataKey="likes"
            fill="#82ca9d"
            name="Likes"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="engagement"
            stroke="#ff7300"
            name="Engagement Rate"
          />
          <Scatter
            yAxisId="left"
            dataKey="shares"
            fill="#8884d8"
            name="Shares"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );

  const renderRetentionChart = () => (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Audience Retention
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={metrics}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <RechartsTooltip />
          <Area
            type="monotone"
            dataKey="retention"
            fill="#8884d8"
            stroke="#8884d8"
          />
          <Line
            type="monotone"
            dataKey="watchTime"
            stroke="#82ca9d"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );

  const renderAudienceSegments = () => (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Audience Segments
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={segments}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {segments.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <RechartsTooltip />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );

  const renderMetricCards = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="textSecondary">
                  Total Views
                </Typography>
                <Visibility color="primary" />
              </Stack>
              <Typography variant="h4">
                {metrics.reduce((sum, m) => sum + m.views, 0).toLocaleString()}
              </Typography>
              <Typography
                variant="body2"
                color="success.main"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <TrendingUp fontSize="small" />
                +15.3% vs last period
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="textSecondary">
                  Engagement Rate
                </Typography>
                <ThumbUp color="primary" />
              </Stack>
              <Typography variant="h4">
                {(metrics.reduce((sum, m) => sum + m.engagement, 0) / metrics.length).toFixed(1)}%
              </Typography>
              <Typography
                variant="body2"
                color="success.main"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <TrendingUp fontSize="small" />
                +5.7% vs last period
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="textSecondary">
                  Watch Time
                </Typography>
                <Schedule color="primary" />
              </Stack>
              <Typography variant="h4">
                {(metrics.reduce((sum, m) => sum + m.watchTime, 0) / metrics.length).toFixed(1)}s
              </Typography>
              <Typography
                variant="body2"
                color="error.main"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <TrendingUp fontSize="small" />
                -2.1% vs last period
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="textSecondary">
                  Social Shares
                </Typography>
                <Share color="primary" />
              </Stack>
              <Typography variant="h4">
                {metrics.reduce((sum, m) => sum + m.shares, 0).toLocaleString()}
              </Typography>
              <Typography
                variant="body2"
                color="success.main"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <TrendingUp fontSize="small" />
                +8.9% vs last period
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Performance Analytics
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {renderMetricCards()}
          </Grid>
          <Grid item xs={12} md={8}>
            {renderEngagementChart()}
          </Grid>
          <Grid item xs={12} md={4}>
            {renderAudienceSegments()}
          </Grid>
          <Grid item xs={12}>
            {renderRetentionChart()}
          </Grid>
        </Grid>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => setTimeRange('7d')}>Last 7 days</MenuItem>
        <MenuItem onClick={() => setTimeRange('30d')}>Last 30 days</MenuItem>
        <MenuItem onClick={() => setTimeRange('90d')}>Last 90 days</MenuItem>
      </Menu>
    </Box>
  );
};
