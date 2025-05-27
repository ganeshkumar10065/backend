const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { getNextProxy } = require('../config/proxies');
const { getHeaders } = require('../config/instagram');

async function makeRequest(url, options = {}) {
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const proxy = getNextProxy();
      const agent = new HttpsProxyAgent(proxy);
      
      const response = await axios({
        ...options,
        url,
        httpsAgent: agent,
        proxy: false,
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      if (response.status === 200) {
        return response;
      }

      if (response.status === 403 || response.status === 429) {
        console.log(`Proxy ${proxy} returned ${response.status}, trying next proxy...`);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${i + 1} failed with proxy ${getNextProxy()}: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw lastError;
}

module.exports = {
  makeRequest
}; 