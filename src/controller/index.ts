import fs from 'fs/promises';
import path from 'path';
import { ConstructableT } from "@xprofiler/injection";
import { HTTP_CONTROLLER_METADATA_KEY } from '../constant';
import { is } from '../common/is';


export async function scan(): Promise<ConstructableT[]> {
  const list = new Array<ConstructableT>();
  const ignore = [/shared/, /index/, /.ts/, /.map/];

  const files = await fs.readdir(__dirname);
  for (const file of files) {
    if (ignore.some(reg => reg.exec(file))) {
      continue;
    }

    const filePath = path.join(__dirname, file);
    const controller = await import(filePath);
    for (const clazz of Object.values(controller)) {
      console.log(12333, clazz, is.class(clazz));
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