const AWS = require('aws-sdk');
const { config, isAWSConfigured } = require('./config');

// AWS Configuration from centralized config
const awsConfig = config.aws;

// Initialize AWS services
let s3, cloudFront, mediaConvert;

try {
  if (isAWSConfigured()) {
    // Initialize S3
    s3 = new AWS.S3({
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
      region: awsConfig.s3.region
    });

    // Initialize CloudFront (if configured)
    if (awsConfig.cloudFront.distributionId) {
      cloudFront = new AWS.CloudFront({
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
        region: 'us-east-1' // CloudFront is always us-east-1
      });
    }

    // Initialize MediaConvert (if configured)
    if (awsConfig.mediaConvert.endpoint) {
      mediaConvert = new AWS.MediaConvert({
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
        region: awsConfig.region,
        endpoint: awsConfig.mediaConvert.endpoint
      });
    }

    console.log('✅ AWS services initialized successfully');
  } else {
    console.warn('⚠️ AWS not configured - S3, CloudFront, and MediaConvert services will not be available');
  }
} catch (error) {
  console.error('❌ Failed to initialize AWS services:', error.message);
}

// Test AWS connection
const testAWSConnection = async () => {
  try {
    if (!isAWSConfigured()) {
      console.warn('⚠️ AWS not configured, skipping connection test');
      return {
        success: false,
        message: 'AWS not configured',
        services: {}
      };
    }

    // Test S3 connection
    const s3Result = await s3.listBuckets().promise();
    console.log('✅ AWS S3 connection successful');
    console.log('📦 Available buckets:', s3Result.Buckets.map(b => b.Name));
    
    // Test if our bucket exists
    const bucketExists = s3Result.Buckets.some(b => b.Name === awsConfig.s3.bucketName);
    if (!bucketExists) {
      console.log(`⚠️  Bucket '${awsConfig.s3.bucketName}' not found. Please create it first.`);
    } else {
      console.log(`✅ Bucket '${awsConfig.s3.bucketName}' found`);
    }
    
    // Test CloudFront if configured
    let cloudFrontStatus = 'not configured';
    if (cloudFront && awsConfig.cloudFront.distributionId) {
      try {
        await cloudFront.getDistribution({ Id: awsConfig.cloudFront.distributionId }).promise();
        cloudFrontStatus = 'connected';
        console.log('✅ CloudFront connection successful');
      } catch (error) {
        cloudFrontStatus = 'error';
        console.warn('⚠️ CloudFront connection failed:', error.message);
      }
    }
    
    // Test MediaConvert if configured
    let mediaConvertStatus = 'not configured';
    if (mediaConvert && awsConfig.mediaConvert.endpoint) {
      try {
        await mediaConvert.listJobs({ MaxResults: 1 }).promise();
        mediaConvertStatus = 'connected';
        console.log('✅ MediaConvert connection successful');
      } catch (error) {
        mediaConvertStatus = 'error';
        console.warn('⚠️ MediaConvert connection failed:', error.message);
      }
    }
    
    return {
      success: true,
      message: 'AWS connection test completed',
      services: {
        s3: 'connected',
        cloudFront: cloudFrontStatus,
        mediaConvert: mediaConvertStatus
      },
      bucket: bucketExists ? awsConfig.s3.bucketName : null
    };
  } catch (error) {
    console.error('❌ AWS connection test failed:', error.message);
    return {
      success: false,
      message: error.message,
      services: {}
    };
  }
};

// Create S3 bucket if it doesn't exist
const createS3Bucket = async () => {
  try {
    if (!isAWSConfigured()) {
      console.warn('⚠️ AWS not configured, cannot create S3 bucket');
      return false;
    }

    const bucketName = awsConfig.s3.bucketName;
    
    // Check if bucket exists
    try {
      await s3.headBucket({ Bucket: bucketName }).promise();
      console.log(`✅ Bucket '${bucketName}' already exists`);
      return true;
    } catch (error) {
      if (error.statusCode === 404) {
        // Bucket doesn't exist, create it
        const params = {
          Bucket: bucketName,
          CreateBucketConfiguration: {
            LocationConstraint: awsConfig.s3.region
          }
        };
        
        // Remove LocationConstraint for us-east-1
        if (awsConfig.s3.region === 'us-east-1') {
          delete params.CreateBucketConfiguration;
        }
        
        await s3.createBucket(params).promise();
        console.log(`✅ Created S3 bucket: ${bucketName}`);
        
        // Set bucket policy for public read access to media files
        const bucketPolicy = {
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicReadGetObject',
              Effect: 'Allow',
              Principal: '*',
              Action: 's3:GetObject',
              Resource: `arn:aws:s3:::${bucketName}/*`,
              Condition: {
                StringEquals: {
                  's3:ResourceType': 'object'
                }
              }
            }
          ]
        };
        
        await s3.putBucketPolicy({
          Bucket: bucketName,
          Policy: JSON.stringify(bucketPolicy)
        }).promise();
        
        console.log('✅ Set bucket policy for public read access');
        return true;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Error creating S3 bucket:', error.message);
    return false;
  }
};

// Generate CloudFront signed URL for private content
const generateSignedURL = (key, expiresIn = 3600) => {
  if (!awsConfig.cloudFront.distributionId || !cloudFront) {
    console.warn('⚠️ CloudFront not configured, returning S3 URL');
    return getPublicURL(key);
  }
  
  try {
    const signer = new AWS.CloudFront.Signer(
      awsConfig.cloudFront.keyPairId,
      awsConfig.cloudFront.privateKey
    );
    
    const url = `https://${awsConfig.cloudFront.domain}/${key}`;
    const signedUrl = signer.getSignedUrl({
      url,
      expires: Math.floor((Date.now() / 1000) + expiresIn)
    });
    
    return signedUrl;
  } catch (error) {
    console.error('❌ Error generating CloudFront signed URL:', error.message);
    return getPublicURL(key);
  }
};

// Get public URL for content
const getPublicURL = (key) => {
  if (awsConfig.cloudFront.domain) {
    return `https://${awsConfig.cloudFront.domain}/${key}`;
  }
  return `https://${awsConfig.s3.bucketName}.s3.${awsConfig.s3.region}.amazonaws.com/${key}`;
};

// Health check function
const healthCheck = async () => {
  try {
    if (!isAWSConfigured()) {
      return {
        status: 'warning',
        message: 'AWS not configured',
        timestamp: new Date().toISOString(),
        services: {}
      };
    }

    const connectionTest = await testAWSConnection();
    
    return {
      status: connectionTest.success ? 'healthy' : 'error',
      message: connectionTest.message,
      timestamp: new Date().toISOString(),
      services: connectionTest.services
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
      services: {}
    };
  }
};

// Get storage statistics
const getStorageStats = async () => {
  try {
    if (!isAWSConfigured() || !s3) {
      return {
        status: 'warning',
        message: 'AWS not configured',
        stats: null
      };
    }

    const bucketName = awsConfig.s3.bucketName;
    
    // Get bucket size and object count
    const { Contents } = await s3.listObjectsV2({ Bucket: bucketName }).promise();
    
    const stats = {
      bucket: bucketName,
      objectCount: Contents ? Contents.length : 0,
      totalSize: Contents ? Contents.reduce((acc, obj) => acc + (obj.Size || 0), 0) : 0,
      timestamp: new Date().toISOString()
    };
    
    return {
      status: 'success',
      message: 'Storage statistics retrieved successfully',
      stats
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      stats: null
    };
  }
};

module.exports = {
  awsConfig,
  s3,
  cloudFront,
  mediaConvert,
  testAWSConnection,
  createS3Bucket,
  generateSignedURL,
  getPublicURL,
  healthCheck,
  getStorageStats,
  isConfigured: isAWSConfigured
};
