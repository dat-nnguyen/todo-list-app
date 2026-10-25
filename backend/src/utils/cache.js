import Memcached from 'memcached'
import { config } from '../config/index.js'

const client = new Memcached(config.memcached.servers, {
  retries: 1,
  retry: 500,
  remove: true,
  timeout: 1500,
})

function invoke(method, ...args) {
  return new Promise((resolve, reject) => {
    client[method](...args, (error, result) => {
      if (error) return reject(error)
      resolve(result)
    })
  })
}

export const cache = {
  get(key) {
    return invoke('get', key)
  },
  set(key, value, ttlSeconds) {
    return invoke('set', key, value, ttlSeconds)
  },
  delete(key) {
    return invoke('del', key)
  },
}

export function closeCache() {
  client.end()
}
