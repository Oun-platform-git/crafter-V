import mixpanel from 'mixpanel-browser';
import { User } from './CollaborationService';

export interface ProjectMetrics {
  totalDuration: number;
  clipCount: number;
  effectsUsed: string[];
  transitionsUsed: string[];
  audioEffectsUsed: string[];
  aiFeatureUsage: {
    sceneGeneration: number;
    styleTransfer: number;
    compositionSuggestions: number;
    audioEnhancement: number;
  };
  collaborationMetrics: {
    activeUsers: number;
    commentsCount: number;
    changesCount: number;
    versionsCount: number;
  };
  renderMetrics: {
    totalRenders: number;
    averageRenderTime: number;
    qualityDistribution: Record<string, number>;
  };
}

export interface UserMetrics {
  activeTime: number;
  actionsPerformed: number;
  featuresUsed: Set<string>;
  collaborationScore: number;
  projectsCompleted: number;
  averageProjectDuration: number;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  loadTime: number;
  errorRate: number;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized = false;
  private currentUser?: User;
  private sessionStartTime: number;
  private actionCounts: Record<string, number> = {};
  private performanceData: PerformanceMetrics[] = [];
  private projectMetrics: Map<string, ProjectMetrics> = new Map();
  private userMetrics: Map<string, UserMetrics> = new Map();

  private constructor() {
    this.sessionStartTime = Date.now();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  initialize(mixpanelToken: string, user: User) {
    if (this.initialized) return;

    mixpanel.init(mixpanelToken);
    this.currentUser = user;
    this.initialized = true;

    // Initialize user metrics
    this.userMetrics.set(user.id, {
      activeTime: 0,
      actionsPerformed: 0,
      featuresUsed: new Set(),
      collaborationScore: 0,
      projectsCompleted: 0,
      averageProjectDuration: 0
    });

    // Track session start
    this.trackEvent('session_started', {
      userId: user.id,
      userRole: user.role,
      timestamp: this.sessionStartTime
    });

    // Setup performance monitoring
    this.initializePerformanceMonitoring();
  }

  private initializePerformanceMonitoring() {
    // Monitor FPS
    let lastTime = performance.now();
    let frames = 0;

    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        this.trackPerformanceMetric({
          fps,
          memoryUsage: performance.memory?.usedJSHeapSize || 0,
          renderTime: 0,
          loadTime: 0,
          errorRate: 0
        });
        frames = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);

    // Monitor errors
    window.addEventListener('error', (error) => {
      this.trackEvent('error_occurred', {
        errorMessage: error.message,
        errorStack: error.error?.stack,
        timestamp: Date.now()
      });
    });
  }

  trackEvent(eventName: string, properties: Record<string, any> = {}) {
    if (!this.initialized) return;

    const enhancedProperties = {
      ...properties,
      userId: this.currentUser?.id,
      userRole: this.currentUser?.role,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.sessionStartTime
    };

    mixpanel.track(eventName, enhancedProperties);
    this.updateActionCounts(eventName);
  }

  trackPerformanceMetric(metrics: PerformanceMetrics) {
    this.performanceData.push(metrics);

    // Keep only last 100 measurements
    if (this.performanceData.length > 100) {
      this.performanceData.shift();
    }

    // Track if performance degrades significantly
    const averageFPS = this.getAverageFPS();
    if (averageFPS < 30) {
      this.trackEvent('performance_degraded', {
        averageFPS,
        memoryUsage: metrics.memoryUsage,
        renderTime: metrics.renderTime
      });
    }
  }

  trackProjectMetrics(projectId: string, metrics: Partial<ProjectMetrics>) {
    const existing = this.projectMetrics.get(projectId) || {
      totalDuration: 0,
      clipCount: 0,
      effectsUsed: [],
      transitionsUsed: [],
      audioEffectsUsed: [],
      aiFeatureUsage: {
        sceneGeneration: 0,
        styleTransfer: 0,
        compositionSuggestions: 0,
        audioEnhancement: 0
      },
      collaborationMetrics: {
        activeUsers: 0,
        commentsCount: 0,
        changesCount: 0,
        versionsCount: 0
      },
      renderMetrics: {
        totalRenders: 0,
        averageRenderTime: 0,
        qualityDistribution: {}
      }
    };

    this.projectMetrics.set(projectId, {
      ...existing,
      ...metrics
    });

    this.trackEvent('project_metrics_updated', {
      projectId,
      ...metrics
    });
  }

  trackUserActivity(userId: string, activity: {
    type: string;
    duration?: number;
    features?: string[];
    collaborationActions?: number;
  }) {
    const metrics = this.userMetrics.get(userId);
    if (!metrics) return;

    if (activity.duration) {
      metrics.activeTime += activity.duration;
    }

    if (activity.features) {
      activity.features.forEach(feature => metrics.featuresUsed.add(feature));
    }

    if (activity.collaborationActions) {
      metrics.collaborationScore += activity.collaborationActions;
    }

    this.userMetrics.set(userId, metrics);

    this.trackEvent('user_activity', {
      userId,
      ...activity
    });
  }

  generateAnalyticsReport(projectId: string): {
    project: ProjectMetrics;
    users: Record<string, UserMetrics>;
    performance: {
      averageFPS: number;
      averageMemoryUsage: number;
      errorRate: number;
    };
  } {
    const projectMetrics = this.projectMetrics.get(projectId);
    if (!projectMetrics) {
      throw new Error('Project metrics not found');
    }

    const performanceMetrics = {
      averageFPS: this.getAverageFPS(),
      averageMemoryUsage: this.getAverageMemoryUsage(),
      errorRate: this.calculateErrorRate()
    };

    const userMetricsObject: Record<string, UserMetrics> = {};
    this.userMetrics.forEach((metrics, userId) => {
      userMetricsObject[userId] = metrics;
    });

    return {
      project: projectMetrics,
      users: userMetricsObject,
      performance: performanceMetrics
    };
  }

  private updateActionCounts(action: string) {
    this.actionCounts[action] = (this.actionCounts[action] || 0) + 1;
  }

  private getAverageFPS(): number {
    if (this.performanceData.length === 0) return 0;
    const sum = this.performanceData.reduce((acc, curr) => acc + curr.fps, 0);
    return sum / this.performanceData.length;
  }

  private getAverageMemoryUsage(): number {
    if (this.performanceData.length === 0) return 0;
    const sum = this.performanceData.reduce((acc, curr) => acc + curr.memoryUsage, 0);
    return sum / this.performanceData.length;
  }

  private calculateErrorRate(): number {
    const totalActions = Object.values(this.actionCounts).reduce((a, b) => a + b, 0);
    const errorCount = this.actionCounts['error_occurred'] || 0;
    return totalActions === 0 ? 0 : errorCount / totalActions;
  }
}

export default AnalyticsService;
