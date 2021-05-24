import {logger} from './logger.js';
import {settings} from './settings.js';

export class WhisperDialog extends Dialog{
  /*
    Overwrite
    //data
      users => ids or names of users to send messages to
    //options
      skipDialog => option to skip dialog and immediately send to all users or specified users
      chatWhisper => option to send dialog content to a whisper in the chatMessage system as well
  */
  constructor(data, options){
    super(options);
    this.data = data;
    
    /*
      Build Data
    */
    this.data.buttons = {
      Submit : { label : settings.i18n("wd.dialog.button.submit"), icon : ``, },
      Cancel : { label : settings.i18n("wd.dialog.button.cancel"), icon : ``, },
    };
    this.data.default = "Submit";
    this.data.users = this.data?.users ?? [];
    logger.debug(this.data);
    this.data.users = game.users
      .filter(user => user.active && user.id !== game.userId)
      .map(user => {
        let data = { id : user.id, checked : "", name : user.name };
        if((this.data.users).includes(user.id))
          data.checked = "checked";
        return data;
      });

    /*
      Build Options
    */
    this.options.skipDialog = !!options?.skipDialog;
    this.options.chatWhisper = !!options?.chatWhisper;

    if(this.data.users.length === 0) return logger.error(settings.value("wd.dialog.noUserError"));
    if(settings.value("gmOnly") && !game.user.isGM) return logger.error(setting.i18n("wd.dialog.notGMError"));

    /*
      Emit Data or Display Dialog
    */
    if(this.options.skipDialog) WhisperDialog.emitData({ 
      users : this.data.users.length === 0 ?  game.users.map(user => user.id) : this.data.users.map(user => user.id), 
      content : this.data.content, 
      whisper : this.options.chatWhisper });
    else {
      this.render(true);
    }
  }

  static get defaultOptions(){
    return foundry.utils.mergeObject(super.defaultOptions, {
      template : `modules/${settings.NAME}/templates/WhisperDialog.html`,
      classes : [settings.KEY],
      jQuery : true,
      width : 600,
    });
  }

  get title(){
    return this.data.title || settings.TITLE;
  }

  getData(options){
    let data = super.getData(options);
    data.users = this.data.users;
    return data;
  }

  submit(button){
    try {
      let element = this.options.jQuery ? this.element : this.element[0];

      logger.debug("Submit | Button  | ", button);
      logger.debug("Submit | Element | ", element);
      logger.debug("Submit | Data    | ", this.data);
      logger.debug("Submit | Options | ", this.options);

      if(button.label === "Submit")
        WhisperDialog.emitData({
          users : Array.from(element.find('[name=user]')).filter(ele=> ele.checked).map(ele => ele.id),
          content : element.find('[name=content]')[0].value,
          whisper : element.find('[name=whisper]')[0].checked,
        })

    }catch(err) {
      logger.error(err);
    }
    this.close();
  }

  static async confirm({ content, sender }){
    Dialog.confirm({
      title : `Whisper Dialog Message From : ${game.users.get(sender)?.name}`,
      yes : () =>  WhisperDialog.emitResponse({ response : true, users : [sender]}),
      no : () => WhisperDialog.emitResponse({ response : true, users : [sender]}),
      content : content,
    });
  }

  /*
    Dead Methods
  */
  static async prompt({ response, sender }){ 
    Dialog.prompt({
      title : "Whisper Dialog Response",
      content : `User : ${game.users.get(sender)?.name}<br><b>Response : ${response ? "Confirm" : "Reject"}</b>`,
      callback : () => {},
    });
  }

  /*
    Module Methods
  */
  static register(){
    logger.info("Registering Socket Access");
    game.socket.on(`module.${settings.NAME}`, WhisperDialog.recieveData);
    logger.info("Registering Window Access");
    window[settings.KEY] = WhisperDialog;
  }

  static recieveData({ users, content, type, response , sender}){
    logger.debug("Recieve Data | Users    | ", users);
    logger.debug("Recieve Data | Sender   | ", sender);
    logger.debug("Recieve Data | Content  | ", content);
    logger.debug("Recieve Data | Response | ", response);
    logger.debug("Recieve Data | Type     | ", type);

    if(!users.includes(game.userId)) return;

    if(type === "original"){
      WhisperDialog.confirm({ content, sender });
    }
    if(type === "response"){
      WhisperDialog.prompt({ response, sender });
    }
  }

  static emitData({ users, content, whisper }= {}){
    logger.debug("Emit Data | Users   | ", users);
    logger.debug("Emit Data | Content | ", content);
    logger.debug("Emit Data | Whisper | ", whisper);

    if(whisper)
      ChatMessage.create({
        content, whisper : users,
      });

    logger.debug("Attempting to Emit Data", users, content);
    game.socket.emit(`module.${settings.NAME}`, {users, content, type : "original", sender : game.userId});
    logger.debug("Data Emitted");
  }

  static emitResponse({ response, users }){
    if(!settings.value("response")) return;
    logger.debug("Attempting to Emit Response", response);
    game.socket.emit(`module.${settings.NAME}`, { response, type : "response", sender: game.userId, users });
    logger.debug("Data Emitted");
  }

  static renderWhisperIcon(){
    if(!settings.value("icon") || (settings.value("gmOnly") && !game.user.isGM)) return;

    let element = $(`    
    <a class="chat-control-icon whisper-dialog" title="whisper selected players" style="margin-right: 7px">
      <i class="fas fa-user-secret"></i>
    </a>`);

    $("#chat-controls label:first").before(element);
    $("a.whisper-dialog").click(() => new WhisperDialog({},{}));
  }
}