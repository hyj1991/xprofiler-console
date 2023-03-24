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

    check(keys) {
      return async function paramsRequired(ctx, next) {
        if (!ctx.checkPossibleParams(keys)) {
          return;
        }
        await next();
      };
    },
  };
};
