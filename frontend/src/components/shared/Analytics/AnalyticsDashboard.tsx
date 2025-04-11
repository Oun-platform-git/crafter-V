import { FC, useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Group as UsersIcon,
  Speed as PerformanceIcon,
  Download as ExportIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendsIcon,
  Assessment as InsightsIcon
} from '@mui/icons-material';
import AnalyticsService, {
  ProjectMetrics,
  UserMetrics,
  PerformanceMetrics
} from '../../../services/AnalyticsService';

interface ContentAnalytics {
  engagement: {
    averageViewDuration: number;
    retentionRate: number;
    interactionRate: number;
  };
  performance: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  demographics: {
    ageGroups: Record<string, number>;
    regions: Record<string, number>;
    platforms: Record<string, number>;
  };
}

interface AIUsageMetrics {
  promptSuccess: number;
  styleTransfers: number;
  autoEnhancements: number;
  processingTime: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    gpu: number;
  };
}

interface AnalyticsExportData {
  projectMetrics: ProjectMetrics;
  userMetrics: Record<string, UserMetrics>;
  performanceMetrics: {
    averageFPS: number;
    averageMemoryUsage: number;
    errorRate: number;
  } | null;
  contentAnalytics: ContentAnalytics;
  aiMetrics: AIUsageMetrics;
  exportDate: string;
}

interface AnalyticsDashboardProps {
  analyticsService: AnalyticsService;
  projectId: string;
  onExport?: (data: AnalyticsExportData) => void;
}

const AnalyticsDashboard: FC<AnalyticsDashboardProps> = ({
  analyticsService,
  projectId,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics | null>(null);
  const [userMetrics, setUserMetrics] = useState<Record<string, UserMetrics>>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    averageFPS: number;
    averageMemoryUsage: number;
    errorRate: number;
  } | null>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics>({
    engagement: {
      averageViewDuration: 0,
      retentionRate: 0,
      interactionRate: 0
    },
    performance: {
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0
    },
    demographics: {
      ageGroups: {},
      regions: {},
      platforms: {}
    }
  });
  const [aiMetrics, setAiMetrics] = useState<AIUsageMetrics>({
    promptSuccess: 0,
    styleTransfers: 0,
    autoEnhancements: 0,
    processingTime: 0,
    resourceUsage: {
      cpu: 0,
      memory: 0,
      gpu: 0
    }
  });

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const basicReport = await analyticsService.generateAnalyticsReport(projectId);
      
      if (!basicReport) {
        throw new Error('Failed to fetch analytics data');
      }

      setProjectMetrics(basicReport.project);
      setUserMetrics(basicReport.users);
      setPerformanceMetrics(basicReport.performance);
      
      // Set default values for content and AI metrics since they're not available in the service
      setContentAnalytics({
        engagement: { averageViewDuration: 0, retentionRate: 0, interactionRate: 0 },
        performance: { views: 0, likes: 0, shares: 0, comments: 0 },
        demographics: { ageGroups: {}, regions: {}, platforms: {} }
      });
      
      setAiMetrics({
        promptSuccess: 0,
        styleTransfers: 0,
        autoEnhancements: 0,
        processingTime: 0,
        resourceUsage: { cpu: 0, memory: 0, gpu: 0 }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setProjectMetrics(null);
      setUserMetrics({});
      setPerformanceMetrics(null);
      setContentAnalytics({
        engagement: { averageViewDuration: 0, retentionRate: 0, interactionRate: 0 },
        performance: { views: 0, likes: 0, shares: 0, comments: 0 },
        demographics: { ageGroups: {}, regions: {}, platforms: {} }
      });
      setAiMetrics({
        promptSuccess: 0,
        styleTransfers: 0,
        autoEnhancements: 0,
        processingTime: 0,
        resourceUsage: { cpu: 0, memory: 0, gpu: 0 }
      });
    } finally {
      setLoading(false);
    }
  }, [analyticsService, projectId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = useCallback(() => {
    if (onExport && projectMetrics) {
      const exportData: AnalyticsExportData = {
        projectMetrics,
        userMetrics,
        performanceMetrics,
        contentAnalytics,
        aiMetrics,
        exportDate: new Date().toISOString()
      };
      onExport(exportData);
    }
  }, [projectMetrics, userMetrics, performanceMetrics, contentAnalytics, aiMetrics, onExport]);

  const renderProjectMetrics = () => {
    if (!projectMetrics) return null;

    const effectsData = [
      { name: 'Visual Effects', value: projectMetrics.effectsUsed.length },
      { name: 'Transitions', value: projectMetrics.transitionsUsed.length },
      { name: 'Audio Effects', value: projectMetrics.audioEffectsUsed.length }
    ];

    const aiUsageData = Object.entries(projectMetrics.aiFeatureUsage).map(([key, value]) => ({
      name: key.replace(/([A-Z])/g, ' $1').trim(),
      value
    }));

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 16px)' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Project Overview</Typography>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="body1">Total Duration: {projectMetrics.totalDuration}s</Typography>
                <Typography variant="body1">Clip Count: {projectMetrics.clipCount}</Typography>
                <Typography variant="body1">Active Users: {projectMetrics.collaborationMetrics.activeUsers}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 16px)' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Effects Usage</Typography>
              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress
                    variant="determinate"
                    value={Math.min(100, (effectsData[0].value / (effectsData[0].value + effectsData[1].value + effectsData[2].value)) * 100)}
                    size={100}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Typography variant="h6">{effectsData[0].name}: {effectsData[0].value}</Typography>
                  <Typography variant="h6" sx={{ ml: 2 }}>{effectsData[1].name}: {effectsData[1].value}</Typography>
                  <Typography variant="h6" sx={{ ml: 2 }}>{effectsData[2].name}: {effectsData[2].value}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(100% - 16px)' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6">AI Feature Usage</Typography>
              <Box sx={{ p: 2.5 }}>
                {aiUsageData.map((entry, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">{entry.name}</Typography>
                    <Typography variant="body1">{entry.value}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  };

  const renderUserMetrics = () => {
    if (!userMetrics) return null;

    const userData = Object.entries(userMetrics).map(([userId, metrics]) => ({
      userId,
      activeTime: Math.round(metrics.activeTime / 3600), // Convert to hours
      actionsPerformed: metrics.actionsPerformed,
      featuresUsed: metrics.featuresUsed.size,
      collaborationScore: metrics.collaborationScore
    }));

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {userData.map(user => (
          <Box key={user.userId} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
            <Card>
              <CardContent>
                <Typography variant="h6">User {user.userId}</Typography>
                <Box sx={{ p: 2.5 }}>
                  <Typography variant="body1">Active Time: {user.activeTime}h</Typography>
                  <Typography variant="body1">Actions Performed: {user.actionsPerformed}</Typography>
                  <Typography variant="body1">Features Used: {user.featuresUsed}</Typography>
                  <Typography variant="body1">Collaboration Score:</Typography>
                  <CircularProgress
                    variant="determinate"
                    value={Math.min(100, (user.collaborationScore / 100) * 100)}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!performanceMetrics) return null;

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Average FPS</Typography>
              <Box sx={{ textAlign: 'center', p: 2.5 }}>
                <CircularProgress
                  variant="determinate"
                  value={Math.min(100, (performanceMetrics.averageFPS / 60) * 100)}
                  size={100}
                />
                <Typography variant="h4" sx={{ mt: 2 }}>{Math.round(performanceMetrics.averageFPS)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Memory Usage</Typography>
              <Box sx={{ textAlign: 'center', p: 2.5 }}>
                <Typography variant="h4">{Math.round(performanceMetrics.averageMemoryUsage / 1024 / 1024)} MB</Typography>
                <CircularProgress
                  variant="determinate"
                  value={Math.min(100, (performanceMetrics.averageMemoryUsage / (1024 * 1024 * 1024)) * 100)}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Error Rate</Typography>
              <Box sx={{ textAlign: 'center', p: 2.5 }}>
                <Typography variant="h4" color={performanceMetrics.errorRate > 0.05 ? 'error' : 'inherit'}>{(performanceMetrics.errorRate * 100).toFixed(2)}%</Typography>
                <CircularProgress
                  variant="determinate"
                  value={Math.min(100, performanceMetrics.errorRate * 1000)}
                  color={performanceMetrics.errorRate > 0.05 ? 'error' : 'primary'}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  };

  const renderContentAnalytics = () => {
    if (!contentAnalytics) return null;

    const engagementData = [
      {
        name: 'View Duration',
        value: contentAnalytics.engagement.averageViewDuration,
        target: 180 // 3 minutes target
      },
      {
        name: 'Retention',
        value: contentAnalytics.engagement.retentionRate * 100,
        target: 70 // 70% target
      },
      {
        name: 'Interaction',
        value: contentAnalytics.engagement.interactionRate * 100,
        target: 15 // 15% target
      }
    ];

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(66.66% - 16px)' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Content Performance</Typography>
              <Box sx={{ p: 2.5 }}>
                {engagementData.map((entry, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">{entry.name}</Typography>
                    <Typography variant="body1">{entry.value}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Performance Metrics</Typography>
              <Box sx={{ p: 2.5 }}>
                {Object.entries(contentAnalytics.performance).map(([key, value]) => (
                  <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">{key}</Typography>
                    <Typography variant="body1">{value.toLocaleString()}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(100% - 16px)' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6">AI Performance Insights</Typography>
              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Prompt Success Rate:</Typography>
                  <Typography variant="body1">{(aiMetrics.promptSuccess * 100).toFixed(1)}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Resource Utilization:</Typography>
                  <Typography variant="body1">{Object.entries(aiMetrics.resourceUsage).map(([resource, usage]) => `${resource}: ${usage * 100}%`).join(', ')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Processing Time:</Typography>
                  <Typography variant="body1">{(aiMetrics.processingTime / 1000).toFixed(2)}s</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  };

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <Typography variant="h5">Analytics Dashboard</Typography>
        <div className="dashboard-actions">
          <IconButton onClick={() => setIsFilterDialogOpen(true)}>
            <FilterIcon />
          </IconButton>
          <IconButton onClick={fetchAnalytics}>
            <RefreshIcon />
          </IconButton>
          <Button
            startIcon={<ExportIcon />}
            onClick={handleExport}
            disabled={!projectMetrics}
          >
            Export
          </Button>
        </div>
      </div>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Button
          variant={activeTab === 0 ? 'contained' : 'outlined'}
          onClick={() => setActiveTab(0)}
          startIcon={<TimelineIcon />}
        >
          Overview
        </Button>
        <Button
          variant={activeTab === 1 ? 'contained' : 'outlined'}
          onClick={() => setActiveTab(1)}
          startIcon={<UsersIcon />}
        >
          Users
        </Button>
        <Button
          variant={activeTab === 2 ? 'contained' : 'outlined'}
          onClick={() => setActiveTab(2)}
          startIcon={<PerformanceIcon />}
        >
          Performance
        </Button>
        <Button
          variant={activeTab === 3 ? 'contained' : 'outlined'}
          onClick={() => setActiveTab(3)}
          startIcon={<TrendsIcon />}
        >
          Content
        </Button>
        <Button
          variant={activeTab === 4 ? 'contained' : 'outlined'}
          onClick={() => setActiveTab(4)}
          startIcon={<InsightsIcon />}
        >
          AI Insights
        </Button>
      </Box>

      {loading ? (
        <div className="loading-container">
          <CircularProgress />
        </div>
      ) : (
        <div className="dashboard-content">
          {activeTab === 0 && renderProjectMetrics()}
          {activeTab === 1 && renderUserMetrics()}
          {activeTab === 2 && renderPerformanceMetrics()}
          {activeTab === 3 && renderContentAnalytics()}
          {activeTab === 4 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Prompt Success Rate</Typography>
                    <Box sx={{ textAlign: 'center', p: 2.5 }}>
                      <CircularProgress
                        variant="determinate"
                        value={aiMetrics.promptSuccess * 100}
                        size={100}
                      />
                      <Typography variant="h4" sx={{ mt: 2 }}>{(aiMetrics.promptSuccess * 100).toFixed(1)}%</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Resource Utilization</Typography>
                    <Box sx={{ p: 2.5 }}>
                      {Object.entries(aiMetrics.resourceUsage).map(([resource, usage]: [string, number]) => (
                        <Box key={resource} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1">{resource}</Typography>
                          <Typography variant="body1">{(usage * 100).toLocaleString()}%</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Processing Time</Typography>
                    <Box sx={{ textAlign: 'center', p: 2.5 }}>
                      <Typography variant="h4">{(aiMetrics.processingTime / 1000).toFixed(2)}s</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </div>
      )}

      <Dialog
        open={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
      >
        <DialogTitle>Filter Analytics</DialogTitle>
        <DialogContent>
          <Select
            fullWidth
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </DialogContent>
      </Dialog>

      <style>
        {`
          .analytics-dashboard {
            padding: 24px;
          }

          .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }

          .dashboard-actions {
            display: flex;
            gap: 8px;
          }

          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 400px;
          }

          .dashboard-content {
            margin-top: 24px;
          }
        `}
      </style>
    </div>
  );
};

export default AnalyticsDashboard;
