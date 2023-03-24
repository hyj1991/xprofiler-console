import { PREFIX } from "../../../constant";
export const HTTP_CONTROLLER_METADATA_KEY = `${PREFIX}_HTTP_CONTROLLER`;
export const HTTP_METHOD_METADATA_KEY = `${PREFIX}_HTTP_METHOD`;

export const HttpMethods = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  PATCH: 'patch',
  HEAD: 'head',
  OPTIONS: 'options',
  ALL: 'all',
};