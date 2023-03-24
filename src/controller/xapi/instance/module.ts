// @ts-nocheck
import path from 'path';
import { Controller } from '../../shared/base';
import { HttpController, HttpMethod } from '../../../decorator/http';

@HttpController({
  prefix: '/xapi',
  middleware: ['auth.userRequired', 'auth.agentAccessibleRequired', 'params.check'],
  args: {
    'params.check': [['agentId']],
  },
})
export class ModuleController extends Controller {
  @HttpMethod({
    path: '/module_files',
  })
  async getFiles() {
    const { ctx, ctx: { service: { manager } } } = this;
    const { appId, agentId } = ctx.query;

    let list = [];
    const { files } = await manager.getFiles(appId, agentId, 'package', { fromCache: true });
    if (Array.isArray(files)) {
      list = files.map(({ filePath, risk, riskModules }) => {
        return {
          label: path.basename(filePath),
          value: filePath,
          risk, riskModules,
        };
      });
    }

    ctx.body = { ok: true, data: { list } };
  }

  @HttpMethod({
    path: '/module',
    args: {
      'params.check': [['moduleFile']],
    },
  })
  async getModules() {
    const { ctx, ctx: { service: { manager } } } = this;
    const { appId, agentId, moduleFile } = ctx.query;

    const data = await manager.getModules(appId, agentId, moduleFile, { fromCache: true });

    ctx.body = { ok: true, data };
  }
}
