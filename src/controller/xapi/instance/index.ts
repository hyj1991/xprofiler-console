// @ts-nocheck
import { Controller } from '../../shared/base';
import { HttpController, HttpMethod } from '../../../common/decorator/http';

@HttpController({
  prefix: '/xapi',
  middleware: ['auth.userRequired'],
})
export class InstanceController extends Controller {
  @HttpMethod({
    path: '/agents',
    middleware: ['auth.appMemberRequired'],
  })
  async getAgents() {
    const { ctx, ctx: { service: { manager } } } = this;
    const { appId } = ctx.query;

    const { clients } = await manager.getClients(appId);
    let list = [];
    if (Array.isArray(clients)) {
      list = clients.map(({ agentId }) => ({ agentId }));
    }

    ctx.body = { ok: true, data: { list } };
  }

  @HttpMethod({
    path: '/agent',
    middleware: ['auth.agentAccessibleRequired', 'params.check'],
    args: {
      'params.check': [['agentId']]
    }
  })
  async checkAgent() {
    const { ctx, ctx: { app: { isNumber } } } = this;
    const { appId, agentId } = ctx.query;

    const stdout = await ctx.handleXtransitResponse('getAgentOsInfo', appId, agentId);
    if (stdout === false) {
      return;
    }

    const { nodeVersion, alinodeVersion, xtransitVersion, ulimit, osInfo } = JSON.parse(stdout);
    const list = [];
    if (nodeVersion) {
      list.push({ type: 'Node.js 版本', value: `v${nodeVersion}` });
    }
    if (alinodeVersion) {
      list.push({ type: 'AliNode 版本', value: `v${alinodeVersion}` });
    }
    if (xtransitVersion) {
      list.push({ type: 'Xtransit 版本', value: `xtransit@${xtransitVersion}` });
    }
    if (ulimit) {
      list.push({ type: '核心转储限制', value: isNumber(ulimit) && Number(ulimit) !== 0 ? `${ulimit} (blocks)` : ulimit });
    }
    if (osInfo) {
      list.push({ type: '操作系统信息', value: osInfo });
    }

    ctx.body = { ok: true, data: { list } };
  }
}

