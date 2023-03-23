import { ConstructableT } from "@xprofiler/injection";
import { HomeController } from './home';

export const ControllerMap = new Array<ConstructableT>();

// add controller
ControllerMap.push(HomeController);