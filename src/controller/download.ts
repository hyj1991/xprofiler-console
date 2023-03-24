// @ts-nocheck
import { PassThrough } from 'stream';
import { Controller } from './shared/base';
import { HttpController, HttpMethod } from '../decorator/http';

@HttpController({
  middleware: ['auth.userRequired'],
})
export class DownloadController extends Controller {
  @HttpMethod({
    path: '/file/download',
    middleware: ['auth.fileAccessibleRequired', 'params.check'],
    args: {
      'params.check': [['fileId', 'fileType']],
    }
  })
  async downloadFile() {
    const { ctx, ctx: { app: { storage, modifyFileName } } } = this;
    const { fileId, fileType } = ctx.query;
    const { storageKey, [storageKey]: fileName } = ctx.file[ctx.createFileKey(fileId, fileType)];

    if (!fileName) {
      return (ctx.body = { ok: false, message: '文件尚未转储' });
    }

    // set headers
    ctx.set('content-type', 'application/octet-stream');
    ctx.set('content-encoding', 'gzip');
    ctx.set('content-disposition', `attachment;filename=${modifyFileName(fileName)}`);

    // create pass
    const pass = new PassThrough();
    const downloadFileStream = storage.downloadFile(fileName);
    if (typeof downloadFileStream.then === 'function') {
      (await downloadFileStream).pipe(pass);
    } else {
      downloadFileStream.pipe(pass);
    }

    ctx.body = pass;
  }
}