import { logger } from './logger.js';
import { settings } from './settings.js';
import { WhisperDialog } from './WhisperDialog.js';

logger.info(`Initializing Module`);
Hooks.on('init', settings.register);
Hooks.on('setup', WhisperDialog.register);
Hooks.on('renderSidebarTab', WhisperDialog.renderWhisperIcon);


/*
  ! Known Issues :
  
  ? Fixes :
 
  TODO :
    Update JSON
    Fix any Compatibility Issues
    Add Hotkey support (? Possibly ?)

  * Update Notes : 

*/