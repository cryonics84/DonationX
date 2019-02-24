import createServer, { Network } from 'monsterr'
import stage1 from './src/stages/stage1/server'
import * as serverController from "./serverController";

const stages = [stage1]

let events = serverController.serverEvents;
let commands = serverController.serverCommands;

const monsterr = createServer({
  network: Network.pairs(8),
  events,
  commands,
  stages,
  options: {
    clientPassword: undefined,  // can specify client password
    adminPassword: 'sEcr3t'     // and admin password
  }
})

monsterr.run();
serverController.init(monsterr);
