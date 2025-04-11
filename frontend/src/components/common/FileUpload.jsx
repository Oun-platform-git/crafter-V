import React, { useState, useCallback } from 'react';

export default function FileUpload({ onUpload, acceptedTypes = "video/*", maxSize = 1024 * 1024 * 500 }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const validateFile = (file) => {
    if (!file.type.match(acceptedTypes)) {
      throw new Error('Invalid file type. Please upload a video file.');
    }
    if (file.size > maxSize) {
      throw new Error(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    try {
      validateFile(file);
      handleFileUpload(file);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateFile(file);
      handleFileUpload(file);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileUpload = async (file) => {
    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // TODO: Replace with actual upload logic
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      onUpload(file);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      clearInterval(interval);
      setUploadProgress(0);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-gray-700 hover:border-gray-600'
      }`}
    >
      <input
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      
      {uploadProgress > 0 ? (
        <div className="space-y-4">
          <div className="text-lg font-semibold">Uploading...</div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="text-sm text-gray-400">{uploadProgress}%</div>
        </div>
      ) : (
        <>
          <div className="text-4xl mb-4">📤</div>
          <label
            htmlFor="file-upload"
            className="block text-lg font-semibold mb-2 cursor-pointer"
          >
            Drag & drop your video here or click to browse
          </label>
          <p className="text-sm text-gray-400">
            Supports MP4, MOV, AVI up to {maxSize / (1024 * 1024)}MB
          </p>
          {error && (
            <div className="mt-4 text-red-500 text-sm">{error}</div>
          )}
        </>
      )}
    </div>
  );
}
