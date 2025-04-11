export const validateVideoFile = (file: Express.Multer.File): boolean => {
  const allowedTypes = ['video/mp4', 'video/webm'];
  return allowedTypes.includes(file.mimetype);
};
