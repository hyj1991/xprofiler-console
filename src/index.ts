import path from 'path';
import { ConstructableT, Container, Injectable, Inject } from "@xprofiler/injection";
import { scan } from "./controller";
import { IHttpControllerMetadata, IHttpMethodMetadata, IMiddlewareMap, IRouter, } from "./type";
import {
  EGG_CONTEXT, EGG_ROUTER, EGG_MIDDLEWARES,
  HTTP_CONTROLLER_METADATA_KEY, HTTP_METHOD_METADATA_KEY,
} from "./constant";

@Injectable()
export class HttpServer {
  @Inject()
  private container: Container;
  @Inject(EGG_ROUTER)
  private router: IRouter;
  @Inject(EGG_MIDDLEWARES)
  private middlewares: IMiddlewareMap;

  async register() {
    const container = this.container;

    (await scan()).forEach((controller: ConstructableT) => {
      container.set(controller);

      const controllerMetadata: IHttpControllerMetadata =
        Reflect.getMetadata(HTTP_CONTROLLER_METADATA_KEY, controller);

      const methodMetadata: IHttpMethodMetadata[] =
        Reflect.getMetadata(HTTP_METHOD_METADATA_KEY, controller);

      methodMetadata.forEach(metadata => {
        const url = path.join(controllerMetadata.prefix, metadata.path);
        const method = metadata.method ?? controllerMetadata.method;
        const middleware = metadata.middleware
          .concat(controllerMetadata.middleware)
          .map(mid => this.parseMiddleware(mid));
        this.router[method](url, ...middleware, async function (ctx: any) {
          await container.run(async () => {
            container.set({ id: EGG_CONTEXT, value: ctx });
            const instance = container.get(controller) as typeof controller;
            await instance[metadata.prop].call({ ctx });
          });
        });
      });
    });

    await container.findModuleExports();
    console.log(12333, container);
  }

  private parseMiddleware(tags: string, middlewares?: IMiddlewareMap | Function) {
    middlewares ??= this.middlewares;
    if (middlewares && tags) {
      const [tag, ...remain] = tags.split('.');
      return this.parseMiddleware(remain.join('.'), middlewares[tag]);
    }
    return middlewares;
  }
}

export * from "./constant";
export * from "./type";