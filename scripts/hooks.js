import {Logger} from './logger.js';

import * as settings from './settings.js';
import * as dialog from './dialog.js';

Hooks.on('init', ()=>{
  Logger.info("Registering All Settings.");
  settings.registerSettings();
});

Hooks.on('setup', ()=>{
  window.WhisperDialog = {
    newDialog : dialog.newDialog
  };
})

Hooks.on('ready', ()=>{
  game.socket.on('module.whisper-dialog', async (data) =>{
    dialog.recieveData(data);
  });
});