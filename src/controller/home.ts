import { Controller } from "./shared/base";
import { HttpController, HttpMethod } from "../decorator/http";

@HttpController({
  prefix: '/',
  middleware: ['auth.userRequired']
})
export class HomeController extends Controller {
  @HttpMethod()
  async index() {
    const { ctx } = this;
    await ctx.render('index');
  }
}
