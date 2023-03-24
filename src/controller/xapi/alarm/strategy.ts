// @ts-nocheck
import { Controller } from '../../shared/base';
import { HttpController, HttpMethod } from '../../../common/decorator/http';
import { HttpMethods } from '../../../constant';

@HttpController({
  prefix: '/xapi',
  middleware: ['auth.userRequired', 'auth.strategyAccessibleRequired'],
})
export class StrategyController extends Controller {
  @HttpMethod({
    path: '/alarm_strategy',
    method: HttpMethods.PUT,
  })
  async updateStrategy() {
    const { ctx, ctx: { service: { mysql } } } = this;

    await mysql.updateStrategy(ctx.request.body);

    ctx.body = { ok: true };
  }

  @HttpMethod({
    path: '/alarm_strategy_status',
    method: HttpMethods.PUT,
  })
  async updateStrategyStatus() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { strategyId, status } = ctx.request.body;
    const { status: oldStatus } = ctx.strategy;

    if (Number(status) === Number(oldStatus)) {
      ctx.body = { ok: false, message: `此规则已经${oldStatus ? '启用' : '禁用'}` }
      return;
    }
    await mysql.updateStrategyStatus(strategyId, status);

    ctx.body = { ok: true };
  }

  @HttpMethod({
    path: '/alarm_strategy',
    method: HttpMethods.DELETE,
  })
  async deleteStrategy() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { strategyId } = ctx.request.body;

    await mysql.deleteStrategyById(strategyId);

    ctx.body = { ok: true };
  }
}
