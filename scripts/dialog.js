import {Logger} from './logger.js';

export function newDialog({content = ``, title = ``, whisper = [], skipDialog = false, chatWhisper = false} = {})
{
  //Error out if no users and no opportunity to set them (mabye set all available userIds to this now?)
  if(!whisper.length && skipDialog)
    whisper = game.users.filter(u=>u.active && u.id !== game.userId);

  //Error out if any of the users sent are not connected
  if(game.users.filter(u=>u.active && whisper.includes(u.id)).length === 0 && skipDialog)
    return ui.notifications.error(`${i18n("wd.dialog.nullUserError")} : ${users}`);

  //Set title variable.
  title = title || i18n("wd.log.name");

  const connectedUsers = game.users.filter(u => u.active && u.id !== game.userId);
  const playerTokenIds = connectedUsers.map(u => u.character?.id).filter(id => id !== undefined);
  const selectedPlayerIds = canvas.tokens.controlled.map(token => {
    if (playerTokenIds.includes(token.actor.id)) return token.actor.id;
  });

  Logger.debug(`Dialog | Variable Check | `, content, title, whisper, skipDialog, chatWhisper, connectedUsers, playerTokenIds, selectedPlayerIds);

  //Error out if no connected users
  if(connectedUsers.length === 0) 
    return ui.notifications.warn(i18n("wd.dialog.noUserError"));

  if(skipDialog)
  {
    Logger.debug(`Dialog Skipped | Attempting to emit Data.`);

    //Check if user has permission to emit data.
    if(game.settings.get(`whisper-dialog`,`gmOnly`) && !game.user.isGM) return ui.notifications.warn(i18n("wd.dialog.notGMError"));

    let data = {
      title,
      content,
      whisper,
      speaker : game.userId
    };

    game.socket.emit(`module.whisper-dialog`, data);

    Logger.debug(`Data Emitted`, data);

    //Log whisper in the chatLog
    if(chatWhisper)
    {
      ChatMessage.create({ content, whisper, speaker : ChatMessage.getSpeaker() });
    }
  }else{
    Logger.debug(`Dialog Accessed`);

    // use whisper. If that is empty, use selectedPlayerIds;
    let checkedUsersArray = whisper.length ? whisper : selectedPlayerIds;
    // create our select options and mark users checked if token is checked.
    const checkboxList = connectedUsers.map(({id, name, character}) => {
      const checked = checkedUsersArray.includes(character?.id) ? 'checked' : '';
      return `<div><label>
        <div style="display:inline-block;vertical-align:middle"><input type="checkbox" name="${id}" ${checked}></div>
        <div style="display:inline-block;vertical-align:middle">${name}</div>
      </label></div>`;
    });
    // create our whisper options and mark users if still connected
    const whisperOptions = connectedUsers.map(({id,name,character})=>{
      const whispered = whisper.includes(id) ? ` selected` : ``;
      return `<option value="${id}"${whispered}>${name}</option>`;
    });

    //check if the client already wants a chatWhisper
    let checked = chatWhisper ? `checked` : ``;

    //create dialogContent
    const dialogContent = `
    <div class="form-group" style="display:flex">
      <div style="display:flex; flex-direction:column; justify-content:space-between; border-right: solid 1px grey; padding-right: 10px; margin-right: 10px">
        <span style="border-bottom: dashed 1px grey">
          <div style="white-space: nowrap">${i18n("wd.dialog.content.chooseUser")}</div>
          <div style="min-height:6em; width:100%;">${checkboxList.join(' ')}</div>
        </span>

        <label style="white-space: nowrap">
          <div style="display:inline-block;vertical-align:middle"><input type="checkbox" name="chatLog" ${checked}/></div>
          <div style="display:inline-block;vertical-align:middle">${i18n("wd.dialog.content.chatWhisper")}</div>
        </label>
      </div>

      <div>${i18n("wd.dialog.content.message")} <textarea name="content" rows="6" style="width: 250px">${content}</textarea></div>
    </div>
    <br />
    `;

    //create buttons
    const senderButtons = {
      Ok : {
        icon : `<i class="fas fa-check"></i>`,
        label : `${i18n("wd.dialog.button.ok")}`,
        callback : (html) => { 
          Logger.debug("Dialog | Callback html | ", html);
          
          //Check if user has permission to emit data.
          if(game.settings.get(`whisper-dialog`,`gmOnly`) && !game.user.isGM) return ui.notifications.warn(i18n("wd.dialog.notGMError"));

          //get selected users from the dialog
          let users = connectedUsers.filter((user) => html.find(`[name="${user.id}"]`)[0].checked);

          //here is where we could default to "every user since none were chosen"
          if (!users?.length) {
            ui.notifications.warn(i18n("wd.dialog.sendingToAll"));
            users = connectedUsers;
          }

          const html_content = html.find('[name=content]')[0].value;

          let data = {
            title,
            content : html_content,
            whisper : users.map(({id}) => id),
            speaker : game.userId
          }

          game.socket.emit(`module.whisper-dialog`, data);

          Logger.debug(`Data Emitted`, data);

          if (html.find('[name=chatLog]')[0].checked) {
            ChatMessage.create({ flavor : title, content : html_content, whisper: users, speaker : ChatMessage.getSpeaker() });
          }
        }
      },
      Cancel : {
        icon : `<i class="fas fa-ban"></i>`,
        label : `${i18n("wd.dialog.button.cancel")}`,
      }
    };

    new Dialog({
      title,
      content : dialogContent,
      buttons : senderButtons
    }).render(true);
  }
}

export function recieveData({title, content, whisper, speaker}= {})
{
  Logger.debug("Dialog | Recieve Data | Data Check ", title, content, whisper, speaker);

  const fixedContent = `<h3>${content.replace(/(?:\r\n|\r|\n)/g, '<br>')}</h3>`;
  const fixedTitle = title
    ? `${i18n("wd.dialog.recieve.sentFrom")} ${game.users.find(u=>u.id===speaker)?.name} : ` + title
    : `${i18n("wd.dialog.recieve.sentFrom")} ${game.users.find(u=>u.id===speaker)?.name} : ${i18n("wd.dialog.defaultTitle")}`;

  if(!whisper.length || whisper.includes(game.userId))
  {
    Logger.debug(`Dialog | Recieve Data | User Id Included`);

    new Dialog({
      title : fixedTitle,
      content : fixedContent,
      buttons : {}
    }).render(true);
  }
}

function i18n(key)
{
    return game.i18n.localize(key);
}