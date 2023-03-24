// @ts-nocheck
import pMap from 'p-map';
import { Controller } from '../../shared/base';
import { HttpController, HttpMethod } from '../../../common/decorator/http';
import { HttpMethods } from '../../../constant';

@HttpController({
  prefix: '/xapi',
  middleware: ['auth.userRequired', 'auth.appMemberRequired'],
})
export class AlarmController extends Controller {
  @HttpMethod({
    path: '/alarm_strategies',
  })
  async getStrategies() {
    const { ctx, ctx: { service: { mysql, alarm } } } = this;
    const { appId } = ctx.query;

    const strategies = await mysql.getStrategiesByAppId(appId);
    const list = await pMap(strategies, async strategy => {
      const {
        id: strategyId,
        context: contextType,
        push: pushType,
        expression,
        content: alarmContent,
        status,
        webhook: webhookPush,
        wtype: webhookType,
        waddress: webhookAddress,
        wsign: webhookSign,
      } = strategy;

      const history = await alarm.getHistoryByPeriod(strategyId, 24 * 60);

      return {
        strategyId, contextType, pushType,
        expression, alarmContent, status,
        webhookPush: Boolean(webhookPush),
        webhookType, webhookAddress, webhookSign,
        alarmCount: history.length,
      };
    }, { concurrency: 2 });

    ctx.body = { ok: true, data: { list } };
  }

  @HttpMethod({
    path: '/alarm_strategy',
    method: HttpMethods.POST,
  })
  async addStrategy() {
    const { ctx, ctx: { service: { mysql } } } = this;

    await mysql.addStrategy(ctx.request.body);

    ctx.body = { ok: true };
  }
}

