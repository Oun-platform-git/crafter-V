import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const router = express.Router();

// Configure S3 client
const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId!,
    secretAccessKey: config.aws.secretAccessKey!
  }
});

// Configure multer for video upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const fileExtension = path.extname(req.file.originalname);
    const key = `videos/${req.user._id}/${uuidv4()}${fileExtension}`;

    const uploadParams = {
      Bucket: config.aws.s3.bucket,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const videoUrl = `https://${config.aws.s3.bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;

    res.json({
      url: videoUrl,
      key
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Error uploading video' });
  }
});

export default router;
