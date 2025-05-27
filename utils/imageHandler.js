const fs = require('fs');
const path = require('path');
const { makeRequest } = require('./requestHandler');
const { getHeaders } = require('../config/instagram');

// Image cache to prevent duplicate downloads
const imageCache = new Map();

async function downloadAndConvertToBase64(imageUrl) {
  try {
    // Check cache first
    if (imageCache.has(imageUrl)) {
      return imageCache.get(imageUrl);
    }

    const response = await makeRequest(imageUrl, {
      headers: {
        ...getHeaders(),
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      },
      responseType: 'arraybuffer'
    });

    // Validate image data
    if (!response.data || response.data.length === 0) {
      throw new Error('Invalid image data received');
    }

    // Convert to base64
    const base64Image = `data:${response.headers['content-type']};base64,${Buffer.from(response.data).toString('base64')}`;
    imageCache.set(imageUrl, base64Image);
    return base64Image;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}

module.exports = {
  downloadAndConvertToBase64
}; 