// eslint-disable-next-line import/no-unresolved
import PQueue from 'p-queue';

const queue = {};
export default (token, fn, next, ...args) => {
  if (!queue[token]) queue[token] = new PQueue({ concurrency: 1 });
  // eslint-disable-next-line no-console
  console.log(`🌺${args.pop() || ''}: ${Object.keys(queue).length}`.cyan, args);

  queue[token].add(fn);
  queue[token].on('error', (error) => next({ statusCode: 401, message: error }));
  queue[token].on('empty', () => {
    delete queue[token];
  });
};
