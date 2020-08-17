import {Logger} from './logger.js';

export function newDialog({user=``,title=``,content=``}={}, skipDialog = false)
{
  if(user = `` && skipDialog && !game.users.filter(u=>u.active && !u.isGM && u.id === user))
    return ui.notifications.error(`Cannot send dialog to null user.`);
    
  if(title = ``) title = `Send Whisper Dialog`;

  if(content = ``)
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
        <table>
          <tr>
            <th>Choose User</th>
            <th>
              <select id="user">
                ${user_content}
              </select>
            <th>
          </tr>
          <tr>
            <td colspan="2">
              <input name="title" type="text">
            </td>
          </tr>
          <tr>
            <td colspan="2" rowspan"10">
              <input name="content" type="text">
            </td>
          </tr>
        <table>
      </div>`;
  }

  if(skipDialog)
  {
    new Dialog({
      title : title,
      content : content,
      buttons : {
        Ok : {
          icon : ``,
          label : `Ok`,
          callback : (html) => { 
            let data = {
              user : html.find('[name=user]')[0].value,
              title : html.find('[name=title]')[0].value,
              content : html.find('[name=content]')[0].value
            }
            game.socket.emit(`module.whisper-dialog`, {data : data});
          }
        },
        Cancel : {
          icon : ``,
          label : `Cancel`,
        }
      },
      default : `Cancel`
    }).render(true);
  }else{
    let data = {
      user : html.find('[name=user]')[0].value,
      title : html.find('[name=title]')[0].value,
      content : html.find('[name=content]')[0].value
    }
    game.socket.emit(`module.whisper-dialog`, {data : data});
  }
}

export function recieveData(data)
{
  Logger.debug(`Dialog | Receive Data | `, data);
}