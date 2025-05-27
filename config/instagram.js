const account = {
  sessionid: '68594089384%3AfB2QxQA7mmiZaO%3A10%3AAYeuUrpE8EQdTaftSC777ppXQ762_uBOM3X0-wqjLg',
  csrftoken: 'xNFgphFoMaETdIRcAscr1x',
  ds_user_id: '68594089384',
  rur: 'NHA\\05468594089384\\0541779623356:01f71b9218ed4e122cf7797435226939ebc585eaffb25dca9ade78692f800cc2a89b6c5f'
};

const userAgents = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 155.0.0.37.107',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
];

function getHeaders() {
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  return {
    'User-Agent': userAgent,
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.instagram.com/',
    'Origin': 'https://www.instagram.com',
    'X-IG-App-ID': '936619743392459',
    'Cookie': `sessionid=${account.sessionid}; csrftoken=${account.csrftoken}; ds_user_id=${account.ds_user_id}; rur=${account.rur}`,
    'Sec-Fetch-Site': 'same-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Connection': 'keep-alive'
  };
}

module.exports = {
  getHeaders
}; 