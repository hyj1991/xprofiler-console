// @ts-nocheck
import pMap from 'p-map';
import { Controller } from "./shared/base";
import { HttpController, HttpMethod } from "../common/decorator/http";
import { HttpMethods } from '../constant';

@HttpController({
  prefix: '/xapi',
  middleware: ['auth.userRequired', 'auth.appOwnerRequired']
})
export class SettingsController extends Controller {
  @HttpMethod({
    path: '/settings'
  })
  async getSettingInfo() {
    const { ctx } = this;
    const { info: { id: appId, name, secret } } = ctx.appInfo;

    ctx.body = { ok: true, data: { appId, name, secret } };
  }

  @HttpMethod({
    path: '/settings_app_name',
    method: HttpMethods.PUT,
    middleware: ['params.check'],
    args: {
      'params.check': [['newAppName']]
    }
  })
  async renameApp() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { appId, newAppName } = ctx.request.body;

    await mysql.renameApp(appId, newAppName);

    ctx.body = { ok: true };
  }

  @HttpMethod({
    path: '/settings_app',
    method: HttpMethods.DELETE,
  })
  async deleteApp() {
    const { ctx, ctx: { app: { storage }, service: { mysql } } } = this;
    const { appId } = ctx.request.body;

    // delete storage files
    const [files, coredumps] = await Promise.all([
      await mysql.getFiles(appId, 'all'),
      await mysql.getCoredumps(appId),
    ]);
    const storages = [
      ...files.map(file => file.storage),
      ...coredumps.map(core => core.file_storage),
      ...coredumps.map(core => core.node_storage),
    ];
    await pMap(storages, async fileName => {
      if (!fileName) {
        return;
      }
      await storage.deleteFile(fileName);
    }, { concurrency: 2 });

    // // delete app, app members, files
    const tasks = [];
    tasks.push(mysql.deleteAppByAppId(appId));
    tasks.push(mysql.deleteMembersByAppId(appId));
    tasks.push(mysql.deleteFiles(appId));
    tasks.push(mysql.deleteCoredumps(appId));
    await Promise.all(tasks);

    ctx.body = { ok: true };
  }
}

