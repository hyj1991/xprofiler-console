'use strict';

module.exports = () => {
  return {
    check(...args) {
      const keys = args.reduce((list, arg) => list.concat(...arg), []);
      return async function paramsRequired(ctx, next) {
        if (!ctx.checkPossibleParams(keys)) {
          return;
        }
        await next();
      };
    },
  };
};
