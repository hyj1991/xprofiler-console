// @ts-nocheck
import { Controller } from '../../shared/base';
import { HttpController, HttpMethod } from '../../../common/decorator/http';

@HttpController({
  prefix: '/xapi',
  middleware: ['auth.userRequired', 'auth.strategyAccessibleRequired'],
})
export class HistoryController extends Controller {
  @HttpMethod({
    path: '/alarm_strategy_history',
  })
  async getStrategyHistory() {
    const { ctx, ctx: { service: { alarm, mysql } } } = this;
    const { strategyId, currentPage, pageSize } = ctx.query;
    const { app: appInfo, context: contextType } = ctx.strategy;

    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;
    const history = await alarm.getHistoryByPeriod(strategyId, 24 * 60);
    const { expression } = await mysql.getStrategyById(strategyId);
    const list = history
      .filter((...args) => args[1] >= start && args[1] < end)
      .map(log => {
        const {
          agent: agentId,
          gm_create: time,
          message: alarmContent,
          pid,
        } = log;

        let detailPath = '';
        switch (contextType) {
          case 'xprofiler_log':
            detailPath = `/app/${appInfo}/instance?tab=process&agentId=${agentId}&pid=${pid}`;
            break;
          case 'system_log':
            detailPath = `/app/${appInfo}/instance?tab=system&agentId=${agentId}`;
            break;
          case 'error_log':
            detailPath = `/app/${appInfo}/instance?tab=error_log&agentId=${agentId}`;
            break;
          case 'xtransit_notification':
            if (expression.includes('@core_count') || expression.includes('@core_count')) {
              detailPath = `/app/${appInfo}/file`;
            } else if (!pid) {
              detailPath = `/app/${appInfo}/instance?tab=module_risk&agentId=${agentId}`;
            }
            break;
          default:
            break;
        }

        return {
          appInfo, agentId, time,
          contextType, alarmContent,
          detailPath,
        };
      });
    const count = history.length;

    ctx.body = { ok: true, data: { list, count } };
  }
}
