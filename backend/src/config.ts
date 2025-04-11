interface Config {
  corsOrigin: string;
  mongoUri: string;
  jwtSecret: string;
  aws: {
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    s3: {
      bucket: string;
    };
  };
  ffmpeg: {
    path: string;
  };
  ai: {
    openai: {
      apiKey?: string;
    };
  };
}

const config: Config = {
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/crafterv',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
      bucket: process.env.AWS_S3_BUCKET || 'crafterv-uploads'
    }
  },
  ffmpeg: {
    path: process.env.FFMPEG_PATH || '/usr/local/bin/ffmpeg'
  },
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY
    }
  }
};

export default config;
