const http = require('http');
const https = require('https');
const { config } = require('./config');

class OrdsClient {
  constructor() {
    this.baseUrl = `${config.ords.host}:${config.ords.port}${config.ords.basePath}`;
  }

  // Simple HTTP GET request
  async get(urlPath) {
    const fullUrl = `${this.baseUrl}${urlPath}`;
    const client = fullUrl.startsWith('https') ? https : http;

    return new Promise((resolve, reject) => {
      client.get(fullUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            data
          });
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  // Check ORDS reachability
  async ping() {
    try {
      // Trying the landing page
      const res = await this.get('/_/landing');
      return res.status === 200;
    } catch (err) {
      return false;
    }
  }

  // Check if fusabase is enabled globally on ORDS
  // Unfortunately ORDS doesn't always expose a clean, unauthenticated endpoint to check global feature status.
  // We can try to hit the schema endpoint, but we won't know until we configure the schema.
  // We will mostly rely on the user running the command or pinging the console UI.
  async checkConsoleReachability() {
    try {
      const res = await this.get(`/${config.schema.urlPattern}/_baas-console/`);
      return res.status === 200 || res.status === 302;
    } catch (err) {
      return false;
    }
  }
}

module.exports = new OrdsClient();
