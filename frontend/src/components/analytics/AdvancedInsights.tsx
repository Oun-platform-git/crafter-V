import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  People,
  PlayCircle,
  Share,
  Favorite,
  Comment,
  Psychology,
  AccessTime,
  Public
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAIService } from '../../hooks/useAIService';
import { HeatmapChart } from './HeatmapChart';
import { AudienceInsights } from './AudienceInsights';
import { PredictiveAnalytics } from './PredictiveAnalytics';

interface AnalyticsData {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  watchTime: number;
  retention: number;
  engagement: number;
  trending: boolean;
}

interface Insight {
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  actionable: boolean;
  recommendation?: string;
}

export const AdvancedInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  
  const { analyzeContent } = useAIService();

  useEffect(() => {
    fetchAnalyticsData();
    generateInsights();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics/data?range=${timeRange}`);
      const data = await response.json();
      setAnalyticsData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const generateInsights = async () => {
    try {
      // Use AI to analyze trends and generate insights
      const analysis = await analyzeContent('analytics');
      setInsights(analysis.insights);
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const renderOverviewCards = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="textSecondary" gutterBottom>
                Total Views
              </Typography>
              <PlayCircle color="primary" />
            </Stack>
            <Typography variant="h4">
              {analyticsData.reduce((sum, data) => sum + data.views, 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="success.main">
              +12.5% vs last period
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="textSecondary" gutterBottom>
                Engagement Rate
              </Typography>
              <Favorite color="error" />
            </Stack>
            <Typography variant="h4">
              {(analyticsData.reduce((sum, data) => sum + data.engagement, 0) / analyticsData.length).toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="success.main">
              +5.2% vs last period
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="textSecondary" gutterBottom>
                Avg. Watch Time
              </Typography>
              <AccessTime color="info" />
            </Stack>
            <Typography variant="h4">
              {(analyticsData.reduce((sum, data) => sum + data.watchTime, 0) / analyticsData.length).toFixed(1)}s
            </Typography>
            <Typography variant="body2" color="error.main">
              -2.1% vs last period
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="textSecondary" gutterBottom>
                Global Reach
              </Typography>
              <Public color="success" />
            </Stack>
            <Typography variant="h4">
              32
            </Typography>
            <Typography variant="body2" color="success.main">
              +8 countries
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderEngagementChart = () => (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Engagement Over Time
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={analyticsData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <RechartsTooltip />
          <Area
            type="monotone"
            dataKey="views"
            stackId="1"
            stroke="#8884d8"
            fill="#8884d8"
          />
          <Area
            type="monotone"
            dataKey="likes"
            stackId="2"
            stroke="#82ca9d"
            fill="#82ca9d"
          />
          <Area
            type="monotone"
            dataKey="shares"
            stackId="3"
            stroke="#ffc658"
            fill="#ffc658"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );

  const renderInsightsList = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        AI-Generated Insights
      </Typography>
      <Stack spacing={2}>
        {insights.map((insight, index) => (
          <Card key={index} variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {insight.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {insight.description}
              </Typography>
              {insight.actionable && insight.recommendation && (
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  Recommendation: {insight.recommendation}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Advanced Analytics & Insights
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab icon={<TrendingUp />} label="Overview" />
        <Tab icon={<People />} label="Audience" />
        <Tab icon={<Psychology />} label="Predictive" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {renderOverviewCards()}
              </Grid>
              <Grid item xs={12} md={8}>
                {renderEngagementChart()}
              </Grid>
              <Grid item xs={12} md={4}>
                {renderInsightsList()}
              </Grid>
              <Grid item xs={12}>
                <HeatmapChart data={analyticsData} />
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <AudienceInsights data={analyticsData} />
          )}

          {activeTab === 2 && (
            <PredictiveAnalytics data={analyticsData} />
          )}
        </>
      )}
    </Box>
  );
};
