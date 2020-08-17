export class Logger {
  static info(...args) {
      console.log("Whisper Dialog | ", ...args);
  }

  static debug(...args) {
      if (game.settings.get('whisper-dialog', 'debug'))
          Logger.info("DEBUG | ", ...args);
  }
}