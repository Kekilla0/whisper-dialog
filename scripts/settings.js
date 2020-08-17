import {Logger} from './logger.js';

export function registerSettings()
{
  Logger_Settings();
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