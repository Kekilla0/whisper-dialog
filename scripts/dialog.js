import {Logger} from './logger.js';

export function newDialog(user=``,content=``, title=``, skipDialog = false, emit = true, hideButtons = false)
{
  if(user === `` && skipDialog)
    return ui.notifications.error(`${i18n("wd.dialog.nullUserError")}`);

  if(user !==  `` && game.users.filter(u=>u.active && u.id === user).length === 0)
    return ui.notifications.error(`${i18n("wd.dialog.nullUserError")} : ${user}`);

  if(title === ``) title = `${i18n("wd.dialog.defaultTitle")}`;

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
        ${i18n("wd.dialog.content.chooseUser")}
        <select name="user">${user_content}</select>
        <hr />

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
          let data = {
            user : html.find('[name=user]')[0].value,
            title : title,
            content : html.find('[name=content]')[0].value,
            sender : game.userId
          }
          game.socket.emit(`module.whisper-dialog`, {data});
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
      user : user,
      title : title,
      content : content
    }
    if(emit)
      game.socket.emit(`module.whisper-dialog`, {data : data});
  }
}

export function recieveData({data : { user, title, content, sender }})
{
  Logger.debug(`Dialog | Recieve Data | `, game.userId, user, game.userId === user);
  const fixedContent = `<h3>${content.replace(/(?:\r\n|\r|\n)/g, '<br>')}</h3>`;

  if(game.userId == user)
  {
    Logger.debug(`Dialog | Receive data | Conditional Statment TRUE`);
    newDialog(``,fixedContent,`${title}, ${i18n("wd.dialog.recieve.sentFrom")} ${game.users.find(u=>u.id===sender).name}`,false,false,true); 
  }
}

function i18n(key)
{
    return game.i18n.localize(key);
}