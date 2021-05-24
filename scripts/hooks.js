import { logger } from './logger.js';
import { settings } from './settings.js';
import { WhisperDialog } from './WhisperDialog.js';


logger.info(`Initializing Module`);
Hooks.on('init', settings.register);
Hooks.on('setup', WhisperDialog.register);
Hooks.on('ready', WhisperDialog.renderWhisperIcon);


/*
  Slight re-write of the module
*/