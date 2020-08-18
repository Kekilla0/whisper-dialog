import {Logger} from './logger.js';

import * as settings from './settings.js';
import * as dialog from './dialog.js';

Hooks.on('init', ()=>{
  Logger.info("Registering All Settings.");
  settings.registerSettings();
});

Hooks.on('setup', ()=>{
  Logger.info("Registering Window Extention");
  window.WhisperDialog = {
    newDialog : dialog.newDialog
  };
})

Hooks.on('ready', ()=>{
  Logger.info("Registering Socket");
  game.socket.on('module.whisper-dialog', async (data) =>{
    dialog.recieveData(data);
  });
});