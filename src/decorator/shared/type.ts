import { HttpMethods } from "./constant";

export interface IHttpControllerMetadata {
  prefix: string;
  method: typeof HttpMethods[keyof typeof HttpMethods];
  middleware: string[];
  args: { [key: string]: any[] };
}

export interface IHttpMethodMetadata extends Pick<IHttpControllerMetadata, "method" | "middleware" | "args"> {
  prop: string;
  path: string;
}

export type HttpControllerOptions = Partial<IHttpControllerMetadata>;
export type HttpMethodOptions = Required<Pick<IHttpMethodMetadata, "path">> & Partial<Pick<IHttpMethodMetadata, "method" | "middleware" | "args">>;