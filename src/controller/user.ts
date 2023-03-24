'use strict';

import { Controller } from "./shared/base";
import { HttpController, HttpMethod } from "../decorator/http";

@HttpController({
  prefix: '/xapi',
  middleware: ['auth.userRequired'],
})
export class UserController extends Controller {
  @HttpMethod({
    path: '/user',
  })
  async index() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { nick, userId } = ctx.user;

    const [{ identity }] = await mysql.getUserByUserIds([userId]);

    ctx.body = { ok: true, data: { name: nick, id: identity } };
  }
}

