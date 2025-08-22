const express = require('express');
const router = express.Router();
const { healthCheck: dbHealthCheck, getDatabaseStats } = require('../config/database');
const { healthCheck: awsHealthCheck, getStorageStats } = require('../config/aws');
const hybridStorageService = require('../services/hybridStorageService');
const { config } = require('../config/config');

/**
 * Health Check Endpoints
 * Monitor the health of all services and dependencies
 */

// Overall system health
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check all services
    const [dbHealth, awsHealth, storageHealth] = await Promise.allSettled([
      dbHealthCheck(),
      awsHealthCheck(),
      hybridStorageService.healthCheck()
    ]);
    
    const responseTime = Date.now() - startTime;
    
    // Determine overall status
    let overallStatus = 'healthy';
    let message = 'All services operational';
    
    if (dbHealth.status === 'rejected' || awsHealth.status === 'rejected' || storageHealth.status === 'rejected') {
      overallStatus = 'error';
      message = 'One or more services failed health check';
    } else if (dbHealth.value?.status === 'error' || awsHealth.value?.status === 'error' || storageHealth.value?.status === 'error') {
      overallStatus = 'degraded';
      message = 'Some services are experiencing issues';
    }
    
    const healthData = {
      status: overallStatus,
      message,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: config.app?.version || '1.0.0',
      environment: config.server?.nodeEnv || 'development',
      services: {
        database: dbHealth.status === 'fulfilled' ? dbHealth.value : { status: 'error', message: 'Health check failed' },
        aws: awsHealth.status === 'fulfilled' ? awsHealth.value : { status: 'error', message: 'Health check failed' },
        storage: storageHealth.status === 'fulfilled' ? storageHealth.value : { status: 'error', message: 'Health check failed' }
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      }
    };
    
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthData);
    
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database health check
router.get('/database', async (req, res) => {
  try {
    const health = await dbHealthCheck();
    const stats = await getDatabaseStats();
    
    const response = {
      ...health,
      stats: stats.status === 'success' ? stats.data : null,
      timestamp: new Date().toISOString()
    };
    
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'warning' ? 200 : 503;
    res.status(statusCode).json(response);
    
  } catch (error) {
    console.error('❌ Database health check error:', error);
    res.status(503).json({
      status: 'error',
      message: 'Database health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// AWS health check
router.get('/aws', async (req, res) => {
  try {
    const health = await awsHealthCheck();
    const stats = await getStorageStats();
    
    const response = {
      ...health,
      stats: stats.status === 'success' ? stats.data : null,
      timestamp: new Date().toISOString()
    };
    
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'warning' ? 200 : 503;
    res.status(statusCode).json(response);
    
  } catch (error) {
    console.error('❌ AWS health check error:', error);
    res.status(503).json({
      status: 'error',
      message: 'AWS health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Storage health check
router.get('/storage', async (req, res) => {
  try {
    const health = await hybridStorageService.healthCheck();
    const stats = await hybridStorageService.getStorageStats();
    
    const response = {
      ...health,
      stats: stats.status === 'success' ? stats.data : null,
      timestamp: new Date().toISOString()
    };
    
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    res.status(statusCode).json(response);
    
  } catch (error) {
    console.error('❌ Storage health check error:', error);
    res.status(503).json({
      status: 'error',
      message: 'Storage health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Configuration health check
router.get('/config', (req, res) => {
  try {
    const configHealth = {
      status: 'healthy',
      message: 'Configuration loaded successfully',
      timestamp: new Date().toISOString(),
      config: {
        server: {
          port: config.server?.port,
          environment: config.server?.nodeEnv,
          cors: config.server?.cors
        },
        features: {
          awsStorage: config.features?.awsStorage,
          cloudFront: config.features?.cloudFront,
          mediaConvert: config.features?.mediaConvert,
          qrAuth: config.features?.qrAuth,
          analytics: config.features?.analytics
        },
        services: {
          supabase: config.supabase?.url ? 'configured' : 'not configured',
          aws: config.aws?.accessKeyId ? 'configured' : 'not configured'
        }
      }
    };
    
    res.json(configHealth);
    
  } catch (error) {
    console.error('❌ Configuration health check error:', error);
    res.status(503).json({
      status: 'error',
      message: 'Configuration health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed system information
router.get('/system', (req, res) => {
  try {
    const systemInfo = {
      status: 'healthy',
      message: 'System information retrieved successfully',
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        pid: process.pid,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
        },
        cpu: process.cpuUsage(),
        env: {
          NODE_ENV: process.env.NODE_ENV,
          PORT: process.env.PORT
        }
      },
      dependencies: {
        supabase: !!config.supabase?.url,
        aws: !!config.aws?.accessKeyId,
        cloudFront: !!config.aws?.cloudFront?.distributionId,
        mediaConvert: !!config.aws?.mediaConvert?.endpoint
      }
    };
    
    res.json(systemInfo);
    
  } catch (error) {
    console.error('❌ System info error:', error);
    res.status(503).json({
      status: 'error',
      message: 'System info retrieval failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
