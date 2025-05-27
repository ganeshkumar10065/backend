const proxies = [
  {
    host: '198.23.239.134',
    port: '6540',
    auth: 'iiukzukr:2anbpukm09xk'
  },
  {
    host: '207.244.217.165',
    port: '6712',
    auth: 'iiukzukr:2anbpukm09xk'
  },
  {
    host: '107.172.163.27',
    port: '6543',
    auth: 'iiukzukr:2anbpukm09xk'
  },
  {
    host: '161.123.152.115',
    port: '6360',
    auth: 'iiukzukr:2anbpukm09xk'
  },
  {
    host: '23.94.138.75',
    port: '6349',
    auth: 'iiukzukr:2anbpukm09xk'
  },
  {
    host: '216.10.27.159',
    port: '6837',
    auth: 'iiukzukr:2anbpukm09xk'
  },
  {
    host: '136.0.207.84',
    port: '6661',
    auth: 'iiukzukr:2anbpukm09xk'
  },
  {
    host: '64.64.118.149',
    port: '6732',
    auth: 'iiukzukr:2anbpukm09xk'
  },
  {
    host: '142.147.128.93',
    port: '6593',
    auth: 'iiukzukr:2anbpukm09xk'
  },
  {
    host: '154.36.110.199',
    port: '6853',
    auth: 'iiukzukr:2anbpukm09xk'
  }
];

let currentProxyIndex = 0;

function getNextProxy() {
  const proxy = proxies[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % proxies.length;
  return `http://${proxy.auth}@${proxy.host}:${proxy.port}`;
}

module.exports = {
  getNextProxy
}; 