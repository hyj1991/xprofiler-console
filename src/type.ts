import { Router } from 'egg';

export interface IMiddlewareMap {
  [key: string]: Function;
}

export interface IRouter extends Router { };

export * from './decorator/shared/type';