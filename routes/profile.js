const express = require('express');
const router = express.Router();
const { makeRequest } = require('../utils/requestHandler');
const { getHeaders } = require('../config/instagram');
const { downloadAndConvertToBase64 } = require('../utils/imageHandler');
const { sendUserSearchLog, sendErrorLog } = require('../utils/telegramBot');

// Handle OPTIONS requests for all profile routes
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, User-Agent');
  res.header('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

// Add CORS headers to all responses
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, User-Agent');
  next();
});

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    // Try web profile info endpoint first
    const webProfileUrl = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
    const response = await makeRequest(webProfileUrl, { headers: getHeaders() });

    if (response.data?.data?.user) {
      const userData = response.data.data.user;
      
      // Download and convert profile picture to base64
      const profilePicBase64 = userData.profile_pic_url ? 
        await downloadAndConvertToBase64(userData.profile_pic_url) : null;

      userData.profile_pic_url = profilePicBase64;
      delete userData.profile_pic_url_hd; // Remove HD version since we're not using it

      // Send user search log to Telegram
      sendUserSearchLog(userData);

      return res.json({ data: userData, success: true });
    }

    // Fallback to legacy endpoint
    const legacyUrl = `https://www.instagram.com/${username}/?__a=1&__d=dis`;
    const legacyResponse = await makeRequest(legacyUrl, { headers: getHeaders() });

    if (legacyResponse.data?.graphql?.user) {
      const userData = legacyResponse.data.graphql.user;
      const transformedData = {
        username: userData.username,
        full_name: userData.full_name,
        biography: userData.biography,
        profile_pic_url: userData.profile_pic_url,
        edge_followed_by: { count: userData.edge_followed_by.count },
        edge_follow: { count: userData.edge_follow.count },
        edge_owner_to_timeline_media: { count: userData.edge_owner_to_timeline_media.count },
        is_private: userData.is_private,
        is_verified: userData.is_verified,
        is_business_account: userData.is_business_account,
        is_professional_account: userData.is_professional_account,
        highlight_reel_count: userData.highlight_reel_count || 0
      };

      // Download and convert profile picture to base64
      const profilePicBase64 = transformedData.profile_pic_url ? 
        await downloadAndConvertToBase64(transformedData.profile_pic_url) : null;

      transformedData.profile_pic_url = profilePicBase64;

      // Send user search log to Telegram
      sendUserSearchLog(transformedData);

      return res.json({ data: transformedData, success: true });
    }

    res.status(404).json({
      success: false,
      message: 'Profile not found'
    });

  } catch (error) {
    console.error('Error fetching profile data:', error);
    
    // Send error log to Telegram
    sendErrorLog(error, username);
    
    if (error.response?.status === 403 || error.response?.status === 429) {
      return res.status(error.response.status).json({
        success: false,
        status: error.response.status,
        message: 'Rate limited or forbidden, please try again.'
      });
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        message: 'Instagram service temporarily unavailable'
      });
    }

    res.status(error.response?.status || 500).json({
      success: false,
      status: error.response?.status || 'unknown',
      message: error.response?.statusText || error.message
    });
  }
});

module.exports = router; 