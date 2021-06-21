import { settings } from './settings.js';

export class logger {
  static info(...args) {
    console.log(`${settings.TITLE} | `, ...args);
  }

  static debug(...args) {
    if (settings.value('debug'))
      logger.info("DEBUG | ", ...args);
  }

  static error(...args){
    logger.info("ERROR | ", ...args);
    ui.notifications.error(`Error : ${args.join(` `)}`);
  }
}