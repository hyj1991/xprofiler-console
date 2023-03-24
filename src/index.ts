import path from 'path';
import { ConstructableT, Container, Injectable, Inject } from "@xprofiler/injection";
import { Controller } from "./controller";
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
    await container.findModuleExports();

    (await Controller.scan()).forEach((controller: ConstructableT) => {
      container.set(controller);

      const controllerMetadata: IHttpControllerMetadata =
        Reflect.getMetadata(HTTP_CONTROLLER_METADATA_KEY, controller);

      const methodMetadata: IHttpMethodMetadata[] =
        Reflect.getMetadata(HTTP_METHOD_METADATA_KEY, controller);

      methodMetadata.forEach(metadata => {
        const url = path.join(controllerMetadata.prefix, metadata.path);
        const method = metadata.method || controllerMetadata.method;
        const args = this.assign(controllerMetadata.args, metadata.args);
        const middleware = Array.from(new Set(controllerMetadata.middleware
          .concat(metadata.middleware)))
          .map(mid => this.parseMiddleware(mid, args[mid]));
        this.router[method](url, ...middleware, async function (ctx: any) {
          await container.run(async () => {
            const ctrl = container.choose(controller);
            ctrl.set({ id: EGG_CONTEXT, value: ctx });
            const instance = ctrl.get(controller) as typeof controller;
            await instance[metadata.prop].call(instance);
          });
        });
      });
    });

    console.log('------->', container.children[0]);
  }

  private parseMiddleware(tags: string, args: any[] = [], middlewares?: IMiddlewareMap | Function) {
    middlewares ??= this.middlewares;
    if (middlewares && tags) {
      const [tag, ...remain] = tags.split('.');
      return this.parseMiddleware(remain.join('.'), args, middlewares[tag]);
    }

    if (args.length) {
      return (middlewares as (...args: any[]) => Function).call(null, ...args);
    }
    return middlewares;
  }

  private assign(...args: { [key: string]: any[] }[]): { [key: string]: any[] } {
    const result: { [key: string]: any[] } = {};
    args.forEach(arg => {
      Object.keys(arg).forEach(key => {
        if (!result[key]) {
          result[key] = [];
        }
        result[key] = result[key].concat(arg[key]);
      });
    });

    return result;
  }
}

export * from "./constant";
export * from "./type";