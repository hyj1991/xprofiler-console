import { HttpMethods } from "./constant";

export interface IHttpControllerMetadata {
  prefix: string;
  method: typeof HttpMethods[keyof typeof HttpMethods];
  middleware: string[];
}

export interface IHttpMethodMetadata extends Pick<IHttpControllerMetadata, "method" | "middleware"> {
  prop: string;
  path: string;
}

export type HttpControllerOptions = Partial<IHttpControllerMetadata>;
export type HttpMethodOptions = Required<Pick<IHttpMethodMetadata, "path">> & Partial<Pick<IHttpMethodMetadata, "method" | "middleware">>;