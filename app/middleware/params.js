'use strict';

module.exports = () => {
  return {
    checkParams(keys) {
      return async function paramsRequired(ctx, next) {
        if (!ctx.checkPossibleParams(keys)) {
          return;
        }
        await next();
      };
    },

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
