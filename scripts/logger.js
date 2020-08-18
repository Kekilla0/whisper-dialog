export class Logger {
  static info(...args) {
      console.log(`${i18n("wd.log.name")} | `, ...args);
  }

  static debug(...args) {
      if (game.settings.get('whisper-dialog', 'debug'))
          Logger.info(`${i18n("wd.log.name")} | `, ...args);
  }
}

function i18n(key)
{
    return game.i18n.localize(key);
}