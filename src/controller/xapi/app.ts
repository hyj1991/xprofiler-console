'use strict';

import { Controller } from "../shared/base";
import { HttpController, HttpMethod } from "../../decorator/http";
import { HttpMethods } from "../../constant";

@HttpController({
  prefix: '/xapi',
  middleware: ['auth.userRequired'],
})
export class AppController extends Controller {
  @HttpMethod({
    path: '/apps',
    middleware: ['params.check'],
    args: {
      'params.check': [['type']]
    }
  })
  async getApps() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { userId } = ctx.user;
    const { type } = ctx.query;

    // get my/joined apps
    let list: any[] = [];
    if (type === 'myApps') {
      list = await mysql.getMyApps(userId);
    }
    if (type === 'joinedApps') {
      list = await mysql.getJoinedApps(userId, 2);
    }
    list = list.map(({ name, id: appId }) => ({ name, appId }));

    // get invitations
    const invitedApps = await mysql.getJoinedApps(userId, 1);
    const users = await ctx.getUserMap(invitedApps.map(item => item.owner));
    const invitations = invitedApps.map(app => {
      const { id: appId, name: appName, owner } = app;
      return {
        appId, appName,
        ownerInfo: users[owner] && users[owner].nick || 'Unknown',
      };
    });

    ctx.body = { ok: true, data: { list, invitations } };
  }

  @HttpMethod({
    path: '/app',
    method: HttpMethods.POST,
    middleware: ['params.check'],
    args: {
      'params.check': [['newAppName']]
    }
  })
  async saveApp() {
    const { ctx, ctx: { app } } = this;
    const { userId } = ctx.user;
    const { newAppName } = ctx.request.body;

    const appSecret = (app as any).createAppSecret(userId, newAppName);

    const res = await ctx.tryCatch('mysql', 'saveApp', [userId, newAppName, appSecret], '不能创建重复应用');
    if (!res) {
      return;
    }
    const { insertId: appId } = res;
    const data = {
      appName: newAppName,
      appId, appSecret,
    };
    ctx.body = { ok: true, data };
  }

  @HttpMethod({
    path: '/app',
    middleware: ['auth.appMemberRequired'],
  })
  async getAppInfo() {
    const { ctx } = this;
    const { owner: currentUserIsOwner, info: { name: appName } } = ctx.appInfo;

    ctx.body = { ok: true, data: { currentUserIsOwner, appName } };
  }
}

