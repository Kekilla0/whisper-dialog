import {Logger} from './logger.js';

export function newDialog(user=``,title=``,content=``, skipDialog = false, emit = true, hideButtons = false)
{
  if(user === `` && skipDialog && !game.users.filter(u=>u.active && !u.isGM && u.id === user))
    return ui.notifications.error(`Cannot send dialog to null user.`);

  if(title === ``) title = `Send Whisper Dialog`;

  if(content === ``)
  {
    let connected_users = game.users.filter(u=>u.active && !u.isGM).map(u=>`${u.id}.${u.name}`);
    
    let user_content = ``;

    for(let user of connected_users)
    {
      let arr = user.split(`.`);
      user_content += `<option value="${arr[0]}">${arr[1]}</option>`;
    }

    content = `
      <div class="form-group">
        Choose User: 
        <select name="user">${user_content}</select>
        <hr />

        Message: <textarea name="content" rows="5"></textarea>
      </div>
        `;
  }

  Logger.debug(`Dialog | Variable Check | `, user, title, content, skipDialog);

  const senderButtons = {
    Ok : {
      icon : ``,
      label : `Ok`,
      callback : (html) => { 
        Logger.debug(html);

        if(emit)
        {
          let data = {
            user : html.find('[name=user]')[0].value,
            title : 'For your eyes only',
            content : html.find('[name=content]')[0].value
          }
          game.socket.emit(`module.whisper-dialog`, {data});
        }              
      }
    },
    Cancel : {
      icon : ``,
      label : `Cancel`,
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

export function recieveData({data : { user, title, content }})
{
  Logger.debug(`Dialog | Recieve Data | `, game.userId, user, game.userId === user);
  const fixedContent = `<h3>${content.replace(/(?:\r\n|\r|\n)/g, '<br>')}</h3>`;

  if(game.userId == user)
  {
    Logger.debug(`Dialog | Receive data | Conditional Statment TRUE`);
    newDialog(``,title,fixedContent,false,false,true); 
  }
}
