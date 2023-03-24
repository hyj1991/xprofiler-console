
import { Injectable, ScopeType } from "@xprofiler/injection";
import {
  HttpMethods,
  HTTP_CONTROLLER_METADATA_KEY, HTTP_METHOD_METADATA_KEY,
} from "./shared/constant";
import { HttpControllerOptions, HttpMethodOptions, IHttpControllerMetadata, IHttpMethodMetadata } from "./shared/type";

export function HttpController(options?: HttpControllerOptions) {
  return (target: any) => {
    const metadata: IHttpControllerMetadata = {
      prefix: "",
      method: HttpMethods.GET,
      middleware: [],
      args: {},
      ...options
    }
    Reflect.defineMetadata(HTTP_CONTROLLER_METADATA_KEY, metadata, target);

    // make the controller injectable
    Injectable({ scope: ScopeType.EXECUTION })(target);
  };
}

export function HttpMethod(options?: HttpMethodOptions) {
  return (target: any, property: string) => {
    const prop: IHttpMethodMetadata = {
      prop: property,
      path: "",
      method: HttpMethods.GET,
      middleware: [],
      args: {},
      ...options
    };

    const clazz = target.constructor;
    const metadata: IHttpMethodMetadata[] = Reflect.getMetadata(HTTP_METHOD_METADATA_KEY, clazz) || [];
    metadata.push(prop);
    Reflect.defineMetadata(HTTP_METHOD_METADATA_KEY, metadata, clazz);
  };
}