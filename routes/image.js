const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { makeRequest } = require('../utils/requestHandler');
const { getHeaders } = require('../config/instagram');

router.get('/', async (req, res) => {
  const imageUrl = req.query.url;
  
  if (!imageUrl) {
    return res.status(400).send('Image URL is required');
  }

  // If it's already a local image, serve it directly
  if (imageUrl.startsWith('/images/')) {
    const imagePath = path.join(__dirname, '..', imageUrl);
    console.log('Attempting to serve local image:', imagePath);
    
    if (fs.existsSync(imagePath)) {
      return res.sendFile(imagePath);
    }
    console.log('Local image not found, redirecting to default');
    return res.redirect('/public/default-avatar.png');
  }

  // Handle external image URLs
  try {
    const response = await makeRequest(imageUrl, {
      headers: {
        ...getHeaders(),
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      },
      responseType: 'stream'
    });

    res.set('Content-Type', response.headers['content-type']);
    res.set('Cache-Control', 'public, max-age=86400');
    response.data.pipe(res);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.redirect('/public/default-avatar.png');
  }
});

module.exports = router; 