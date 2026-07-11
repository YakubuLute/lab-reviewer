import Redis from 'ioredis';

let _client: Redis | null = null;

export function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (_client) return _client;

  _client = new Redis(process.env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });

  _client.on('error', (err: Error) => {
    console.warn('[redis] error (caching degraded):', err.message);
  });

  return _client;
}
