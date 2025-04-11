import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Button,
  Tooltip
} from '@mui/material';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
  Legend, ResponsiveContainer, Scatter, ScatterChart
} from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { PerformanceMetrics } from './PerformanceMetrics';
import { AudienceInsights } from './AudienceInsights';
import { AIMetrics } from './AIMetrics';
import { HeatMap } from './HeatMap';

const COLORS = {
  primary: '#2196f3',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#00bcd4'
};

export const AdvancedAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  const { getAdvancedAnalytics } = useAnalytics();

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const analyticsData = await getAdvancedAnalytics(timeRange);
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const engagementScore = useMemo(() => {
    if (!data) return 0;
    
    const {
      viewsWeight = 0.3,
      likesWeight = 0.2,
      commentsWeight = 0.3,
      sharesWeight = 0.2
    } = data.weights || {};

    return (
      (data.views * viewsWeight) +
      (data.likes * likesWeight) +
      (data.comments * commentsWeight) +
      (data.shares * sharesWeight)
    ).toFixed(2);
  }, [data]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) return null;

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Overview" />
        <Tab label="Performance" />
        <Tab label="Audience" />
        <Tab label="AI Insights" />
        <Tab label="Predictions" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Engagement Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.engagementTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stackId="1"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stackId="2"
                    stroke={COLORS.success}
                    fill={COLORS.success}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Content Performance
              </Typography>
              <HeatMap data={data.contentHeatmap} />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Audience Behavior
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" name="Time" />
                  <YAxis dataKey="engagement" name="Engagement" />
                  <ChartTooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter
                    name="User Interactions"
                    data={data.audienceBehavior}
                    fill={COLORS.info}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <PerformanceMetrics
          data={data.performance}
          engagementScore={engagementScore}
        />
      )}

      {activeTab === 2 && (
        <AudienceInsights
          demographics={data.demographics}
          interests={data.interests}
          locations={data.locations}
        />
      )}

      {activeTab === 3 && (
        <AIMetrics
          generations={data.aiGenerations}
          effectiveness={data.aiEffectiveness}
          trends={data.aiTrends}
        />
      )}

      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Growth Predictions
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.predictions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke={COLORS.primary}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke={COLORS.success}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
