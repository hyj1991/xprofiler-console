import fs from 'fs/promises';
import path from 'path';
import { ConstructableT, Module } from "@xprofiler/injection";
import { HTTP_CONTROLLER_METADATA_KEY } from '../constant';
import { is } from '../common/is';

@Module()
export class Controller {
  static async scan(dirname: string = __dirname): Promise<ConstructableT[]> {
    const list = new Array<ConstructableT>();
    const ignore = [/.ts/, /.map/];

    const files = await fs.readdir(dirname);
    for (const file of files) {
      if (ignore.some(reg => reg.exec(file))) {
        continue;
      }

      const filePath = path.join(dirname, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        list.push(...await this.scan(filePath));
        continue;
      }

      const controller = await import(filePath);
      for (const clazz of Object.values(controller)) {
        if (!is.class(clazz)) {
          continue;
        }

        const metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA_KEY, clazz as ConstructableT);
        if (!metadata) {
          continue;
        }

        list.push(clazz as ConstructableT);
      }
    }

    return list;
  }
}