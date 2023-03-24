// @ts-nocheck
import qs from 'querystring';
import { Controller } from './shared/base';
import { HttpController, HttpMethod } from '../common/decorator/http';

@HttpController({
  prefix: '/dashboard',
  middleware: ['auth.userRequired', 'auth.fileAccessibleRequired', 'params.check'],
  args: {
    'params.check': [['fileId', 'fileType']]
  }
})
export class ToolsController extends Controller {
  private chooseDevtools(type) {
    const { ctx, ctx: { app } } = this;
    const { fileId, fileType, selectedTab } = ctx.query;
    const { storage } = ctx.file[ctx.createFileKey(fileId, fileType)];

    if (!storage) {
      return (ctx.body = { ok: false, message: '文件未转储' });
    }

    const fileName = app.modifyFileName(storage);
    const query = { fileId, fileType, fileName, selectedTab };
    ctx.redirect(`/public/devtools/${type}/devtools_app.html?${qs.stringify(query)}`);
  }

  @HttpMethod({
    path: '/devtools-new',
    args: {
      'params.check': [['selectedTab']]
    }
  })
  newDevtools() {
    this.chooseDevtools('new');
  }

  @HttpMethod({
    path: '/devtools-old',
    args: {
      'params.check': [['selectedTab']]
    }
  })
  oldDevtools() {
    this.chooseDevtools('old');
  }

  @HttpMethod({
    path: '/speedscope',
    args: {
      'params.check': [['downloadPath']]
    }
  })
  speedscope() {
    const { ctx, ctx: { app } } = this;
    const { fileId, fileType, downloadPath } = ctx.query;

    const { storage } = ctx.file[ctx.createFileKey(fileId, fileType)];

    if (!storage) {
      return (ctx.body = { ok: false, message: '文件未转储' });
    }

    const fileName = app.modifyFileName(storage);
    const query = {
      profileURL: encodeURIComponent(`${downloadPath}?fileType=${fileType}&fileId=${fileId}`),
      title: fileName,
    };
    ctx.redirect(`/public/speedscope/flamegraph.html?#${qs.stringify(query)}`);
  }
}
