import NodeCache from 'node-cache';

class Cache {
  constructor(...args) {
    this.cache = new NodeCache(...args);
  }

  // eslint-disable-next-line class-methods-use-this
  generateRequestKey(req) {
    const appEvent = req.appAuditEvent;
    return `${req.originalUrl}/${appEvent}&accessToken=${req.authz.token}`;
  }

  has(...args) {
    return this.cache.has(...args);
  }

  set(...args) {
    return this.cache.set(...args);
  }

  get(...args) {
    // eslint-disable-next-line no-console
    console.info('💾:cache'.cyan);
    return this.cache.get(...args);
  }

  del(...args) {
    // eslint-disable-next-line no-console
    console.info('💾:cache:deleted'.red);
    return this.cache.del(...args);
  }
}

const localCache = new Cache({ stdTTL: 2, checkperiod: 2 });

export default () => async (req, res, next) => {
  req.localCache = localCache;

  next();
};
