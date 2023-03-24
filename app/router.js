'use strict';

const { Container } = require('@xprofiler/injection');
const { HttpServer,
  EGG_ROUTER,
  EGG_MIDDLEWARES,
} = require('../dist/index');

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = async app => {
  // init container
  const container = new Container();
  container.set({ id: Container, value: container });
  container.set(HttpServer);
  container.set({ id: EGG_ROUTER, value: app.router });
  container.set({
    id: EGG_MIDDLEWARES,
    value: {
      auth: app.middlewares.auth({}, app),
      params: app.middleware.params({}, app),
    },
  });

  const server = container.get(HttpServer);
  await server.register();
};
