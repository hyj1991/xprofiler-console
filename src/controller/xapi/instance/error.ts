// @ts-nocheck
import path from 'path';
import { Controller } from '../../shared/base';
import { HttpController, HttpMethod } from '../../../common/decorator/http';

@HttpController({
  prefix: '/xapi',
  middleware: ['auth.userRequired', 'auth.agentAccessibleRequired', 'params.check'],
  args: {
    'params.check': [['agentId']],
  },
})
export class ErrorController extends Controller {
  @HttpMethod({
    path: '/error_files'
  })
  async getFiles() {
    const { ctx, ctx: { service: { manager } } } = this;
    const { appId, agentId } = ctx.query;

    let list = [];
    const { files } = await manager.getFiles(appId, agentId, 'error');
    if (Array.isArray(files)) {
      list = files.map(filePath => {
        return {
          label: path.basename(filePath),
          value: filePath,
        };
      });
    }

    ctx.body = { ok: true, data: { list } };
  }

  @HttpMethod({
    path: '/error_logs',
    args: {
      'params.check': [['errorFile', 'currentPage', 'pageSize']],
    },
  })
  async getLogs() {
    const { ctx, ctx: { service: { manager } } } = this;
    const { appId, agentId, errorFile, currentPage, pageSize } = ctx.query;

    const { errors, count } = await manager.getErrors(appId, agentId, errorFile, currentPage, pageSize);

    ctx.body = {
      ok: true,
      data: {
        count,
        list: Array.isArray(errors) ? errors : [],
      },
    };
  }
}

