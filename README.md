# whisper-dialog
 Sends dialog to specificed connected user.

# Installation
1. Inside Foundry's Configuration and Setup screen, go to **Add-on Modules**
2. Click "Install Module"
3. In the Manifest URL field paste: `https://github.com/Kekilla0/whisper-dialog/raw/master/module.json`

# Usage
Once activated in the module menu, you may use the Macro syntax to send messages to other players via a dialog!

Default Use
WhisperDialog.newDialog();

![In Action](https://i.gyazo.com/89ea3a782c46e1da89a5351e44987d6c.gif)

Advanced Use
1. content : `CONTENT OF THE DIALOG`,
2. title : `TITLE OF THE DIALOG`,
3. whisper : Array of Users to send the message to
4. skipDialog : true/false, //will skip Client Dialog, automatically pushing information to user
5. chatWhisper : true/false //will send a whisper as well as a whisper dialog to the user, mirrors check box in Client Dialog

Extra 
If whisper is left blank and skipDialog is true, will fill whisper array with all available users. 

![In Action](https://i.gyazo.com/546475532d233ba3f4c3a08bda38c348.gif)

# Support
For questions, feature requests, or bug reports, feel free to contact me on the Foundry Discord (Kekilla#7036) or open an issue here directly.
