import {Logger} from './logger.js';

export function newDialog(user=``,content=``, title=``, skipDialog = false, emit = true, hideButtons = false)
{
  if(user === `` && skipDialog)
    return ui.notifications.error(`${i18n("wd.dialog.nullUserError")}`);

  if(user !==  `` && game.users.filter(u=>u.active && u.id === user).length === 0)
    return ui.notifications.error(`${i18n("wd.dialog.nullUserError")} : ${user}`);

  if(title === ``) title = `${i18n("wd.log.name")}`;

  if(content === ``)
  {
    let connected_users = game.users.filter(u=>u.active && u.id !== game.userId).map(u=>`${u.id}.${u.name}`);

    if(connected_users.length === 0) return ui.notifications.warn(`${i18n("wd.dialog.noUserError")}`);
    
    let user_content = ``;

    for(let user of connected_users)
    {
      let arr = user.split(`.`);
      user_content += `<option value="${arr[0]}">${arr[1]}</option>`;
    }

    content = `
      <div class="form-group">
        <div style="display:flex; justify-content:space-between">
          <div>
            ${i18n("wd.dialog.content.chooseUser")} 
            <select name="user">${user_content}</select>
          </div>
          <div>
            <label>
              <div style="display:inline-block;vertical-align:middle"><input type="checkbox" name="chatLog"/></div>
              <div style="display:inline-block;vertical-align:middle">${i18n("wd.dialog.content.chatWhisper")}</div>
            </label>
          </div>
        </div>

        ${i18n("wd.dialog.content.message")} <textarea name="content" rows="5"></textarea>
      </div>
        `;
  }

  Logger.debug(`Dialog | Variable Check | `, user, title, content, skipDialog);

  const senderButtons = {
    Ok : {
      icon : `<i class="fas fa-check"></i>`,
      label : `${i18n("wd.dialog.button.ok")}`,
      callback : (html) => { 
        Logger.debug(html);

        if(emit)
        {
          if(game.settings.get(`whisper-dialog`,`gmOnly`) && !game.user.isGM) return ui.notifications.warn(`${i18n("wd.dialog.notGMError")}`);
          const user = html.find('[name=user]')[0].value;
          const content = html.find('[name=content]')[0].value;
          let data = {
            user,
            title,
            content,
            sender : game.userId
          }
          game.socket.emit(`module.whisper-dialog`, {data});

          if (html.find('[name=chatLog]')[0].checked)
          {
            ChatMessage.create({ content, whisper: [user] });
          }
        }              
      }
    },
    Cancel : {
      icon : `<i class="fas fa-ban"></i>`,
      label : `${i18n("wd.dialog.button.cancel")}`,
    }
  };

  if(!skipDialog)
  {
    Logger.debug(`Dialog | Inside Skip Dialog `);  

    new Dialog({
      title,
      content,
      buttons : hideButtons ? {} : senderButtons
    }).render(true);
  }else{
    let data = {
      user,
      title,
      content
    }
    if(emit)
    {
      if(game.settings.get(`whisper-dialog`,`gmOnly`) && !game.user.isGM) return ui.notifications.warn(`${i18n("wd.dialog.notGMError")}`);
      game.socket.emit(`module.whisper-dialog`, {data});
    }
  }
}

export function recieveData({data : { user, title, content, sender }})
{
  Logger.debug(`Dialog | Recieve Data | `, game.userId, user, game.userId === user);
  const fixedContent = `<h3>${content.replace(/(?:\r\n|\r|\n)/g, '<br>')}</h3>`;

  if(game.userId == user)
  {
    Logger.debug(`Dialog | Receive data | Conditional Statment TRUE`);
    newDialog(``,fixedContent,`${i18n("wd.dialog.recieve.sentFrom")} ${game.users.find(u=>u.id===sender).name}: ${i18n("wd.dialog.defaultTitle")}`,false,false,true);
  }
}

function i18n(key)
{
    return game.i18n.localize(key);
}