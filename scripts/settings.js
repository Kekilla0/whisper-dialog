import {Logger} from './logger.js';

export function registerSettings()
{
  Logger_Settings();
  gmOnly_Settings();
}

function Logger_Settings()
{
  Logger.info("Registering Logger Debugging");
  game.settings.register('whisper-dialog','debug', {
    name : "",
    hint : "",
    scope :"world",
    config : false,
    default : true,
    type : Boolean
  });
}

function gmOnly_Settings()
{
  Logger.info("Registering GM Only Setting");
  game.settings.register('whisper-dialog','gmOnly', {
    name : `${i18n("wd.setting.gmOnly.title")}`,
    hint : `${i18n("wd.setting.gmOnly.hint")}`,
    scope :"world",
    config : true,
    default : false,
    type : Boolean
  });
}

function i18n(key)
{
    return game.i18n.localize(key);
}