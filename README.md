# whisper-dialog

Sends dialog to specificed connected user.

# Installation

1. Inside Foundry's Configuration and Setup screen, go to **Add-on Modules**
2. Click "Install Module"
3. In the Manifest URL field paste: `https://github.com/Kekilla0/whisper-dialog/raw/master/module.json`

# Usage

Once activated in the module menu, you may use the Macro syntax to send messages to other players via a dialog!

Default Use : Button added to Chat Window
Alternate Use : new WhisperDialog(data, options);

![In Action](https://i.gyazo.com/caa64884618a336a759f2e7bf292e5e8.gif)

# Advanced Use

Data :

1. content : `CONTENT OF THE DIALOG`,
2. users : Array of Users to send the message to

Options :

1. skipDialog : true/false, will skip Client Dialog, automatically pushing information to user
2. chatWhisper : true/false will send a whisper as well as a whisper dialog to the user, mirrors check box in Client Dialog

Extra
If whisper is left blank and skipDialog is true, will fill whisper array with all available users.

![In Action](https://i.gyazo.com/8135d2df8114a1b96e365f86dc7627ae.gif)

# Support

For questions, feature requests, or bug reports, feel free to contact me on the Foundry Discord (Kekilla#7036) or open an issue here directly.
