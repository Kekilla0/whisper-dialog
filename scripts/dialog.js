import {Logger} from './logger.js';

export function newDialog({users=[], content=``, title=null, skipDialog=false, emit=true, hideButtons=false, chatWhisper=false} = {})
{
  if(!users.length && skipDialog)
    return ui.notifications.error(i18n("wd.dialog.nullUserError"));

  if(users.length && game.users.filter(u=>u.active && users.includes(u.id)).length === 0)
    return ui.notifications.error(`${i18n("wd.dialog.nullUserError")} : ${users}`);

  title = title || i18n("wd.log.name");

  const connectedUsers = game.users.filter(u => u.active && u.id !== game.userId);
  const playerTokenIds = connectedUsers.map(u => u.character?.id).filter(id => id !== undefined);
  const selectedPlayerIds = canvas.tokens.controlled.map(token => {
    if (playerTokenIds.includes(token.actor.id)) return token.actor.id;
  });

  if(connectedUsers.length === 0) 
    return ui.notifications.warn(i18n("wd.dialog.noUserError"));

  Logger.debug(`Dialog | Variable Check | `, users, title, content, skipDialog);

  if(!skipDialog)
  {
    Logger.debug(`Dialog | Inside Skip Dialog `);  

    // create our select options and mark users selected if token is selected.
    const selectOptions = connectedUsers.map(({id, name, character}) => {
      // select the player automatically if their tokens are selected.
      const selected = selectedPlayerIds.includes(character?.id) ? ' selected' : '';
      return `<option value="${id}"${selected}>${name}</option>`;
    })

    let checked = chatWhisper ? `checked` : ``;
    
    const dialogContent = `
      <div class="form-group" style="display:flex">
        <div style="display:flex; flex-direction:column; justify-content:space-between; border-right: solid 1px grey; padding-right: 10px; margin-right: 10px">
          <span>
            ${i18n("wd.dialog.content.chooseUser")} 
            <select name="user" multiple style="height:6em; width:100%">${selectOptions}</select>
          </span>

          <label>
            <div style="display:inline-block;vertical-align:middle"><input type="checkbox" name="chatLog" ${checked}/></div>
            <div style="display:inline-block;vertical-align:middle">${i18n("wd.dialog.content.chatWhisper")}</div>
          </label>
        </div>

        <div>${i18n("wd.dialog.content.message")} <textarea name="content" rows="6" style="width: 250px">${content}</textarea></div>
      </div>
      <br />
    `;

    const senderButtons = {
      Ok : {
        icon : `<i class="fas fa-check"></i>`,
        label : `${i18n("wd.dialog.button.ok")}`,
        callback : (html) => { 
          Logger.debug(html);
  
          if(emit)
          {
            if(game.settings.get(`whisper-dialog`,`gmOnly`) && !game.user.isGM) return ui.notifications.warn(i18n("wd.dialog.notGMError"));

            const { selectedOptions } = html.find('[name=user]')[0];
            if (!selectedOptions.length) return ui.notifications.warn(i18n("wd.dialog.userRequired"));

            let users = [];
            for (let i=0; i < selectedOptions.length; i++) {
              users.push(selectedOptions[i].value);
            }

            const content = html.find('[name=content]')[0].value;

            users.map(user => {
              let data = {
                user,
                title,
                content,
                sender: game.userId
              }
              game.socket.emit(`module.whisper-dialog`, data);
            })
  
            if (html.find('[name=chatLog]')[0].checked) {
              ChatMessage.create({ content, whisper: users, speaker : ChatMessage.getSpeaker() });
            }
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
      content : emit ? dialogContent : content,
      buttons : hideButtons ? {} : senderButtons
    }).render(true);

  }else{
    Logger.debug(`Dialog | Else side of Skip Dialog`);

    if(emit)
    {
      if(game.settings.get(`whisper-dialog`,`gmOnly`) && !game.user.isGM) return ui.notifications.warn(i18n("wd.dialog.notGMError"));
      users.map(user => {
        game.socket.emit(`module.whisper-dialog`, 
        {
          user,
          title,
          content,
          sender : game.userId
        });
      });
    }
  }
}

export function recieveData({ user, title, content, sender } = {})
{
  Logger.debug("Dialog | Recieve Data | Data Check | ", user, title, content, sender);
  const fixedContent = `<h3>${content.replace(/(?:\r\n|\r|\n)/g, '<br>')}</h3>`;

  if(game.userId === user)
  {
    Logger.debug(`Dialog | Receive data | Conditional Statment TRUE`);

    let fixedTitle = title
      ? `${i18n("wd.dialog.recieve.sentFrom")} ${game.users.find(u=>u.id===sender)?.name} : ` + title
      : `${i18n("wd.dialog.recieve.sentFrom")} ${game.users.find(u=>u.id===sender)?.name} : ${i18n("wd.dialog.defaultTitle")}`;

    let options = {
      users : [],
      content : fixedContent, 
      title : fixedTitle,
      emit : false,
      hideButtons : true,
    }

    newDialog(options);
  }
}

function i18n(key)
{
    return game.i18n.localize(key);
}