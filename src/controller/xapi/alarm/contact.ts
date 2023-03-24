// @ts-nocheck
import { Controller } from '../../shared/base';
import { HttpController, HttpMethod } from '../../../common/decorator/http';
import { HttpMethods } from '../../../constant';

@HttpController({
  prefix: '/xapi',
  middleware: ['auth.userRequired', 'auth.strategyAccessibleRequired'],
})
export class ContactController extends Controller {
  @HttpMethod({
    path: '/alarm_strategy_contacts',
  })
  async getStrategyContacts() {
    const { ctx, ctx: { service: { alarm, mysql } } } = this;
    const { strategyId } = ctx.query;
    const { app } = ctx.strategy;

    const tasks = [];
    tasks.push(mysql.getContactsByStrategyId(strategyId));
    tasks.push(alarm.getTotalContacts(app));
    const [contacts, { totalContacts, userMap }] = await Promise.all(tasks);
    const remainMembers = totalContacts.filter(user => contacts.every(({ user: contact }) => user !== contact));

    ctx.body = {
      ok: true,
      data: {
        contacts: contacts.map(({ user: userId }) => ({ userId, userInfo: userMap[userId] && userMap[userId].nick })),
        remainMembers: remainMembers.map(userId => ({ userId, userInfo: userMap[userId] && userMap[userId].nick })),
      },
    };
  }

  @HttpMethod({
    path: '/alarm_strategy_contact',
    method: HttpMethods.POST,
  })
  async addContactToStrategy() {
    const { ctx, ctx: { service: { alarm, mysql } } } = this;
    const { strategyId, userId } = ctx.request.body;
    const { app } = ctx.strategy;

    if (!await alarm.checkUserInAppMembers(app, userId)) {
      return;
    }
    await mysql.addContactToStrategy(strategyId, userId);

    ctx.body = { ok: true };
  }

  @HttpMethod({
    path: '/alarm_strategy_contact',
    method: HttpMethods.DELETE,
  })
  async deleteContactFromStrategy() {
    const { ctx, ctx: { service: { alarm, mysql } } } = this;
    const { strategyId, userId } = ctx.request.body;
    const { app } = ctx.strategy;

    if (!await alarm.checkUserInAppMembers(app, userId)) {
      return;
    }
    await mysql.deleteContactFromStrategy(strategyId, userId);

    ctx.body = { ok: true };
  }
}
