import { Inject } from '@xprofiler/injection';
import { Context, Controller as EggController } from 'egg';
import { EGG_CONTEXT } from './constant';

export class Controller extends EggController {
  constructor(@Inject(EGG_CONTEXT) ctx: Context) {
    super(ctx);
  }
}