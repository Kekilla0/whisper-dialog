import * as dialog from './dialog.js';

export function renderWhisperIcon() {
    const lang_html = $(`
    <a class="chat-control-icon whisper-dialog" title="whisper selected players" style="margin-right: 7px">
            <i class="fas fa-user-secret"></i>
    </a>
    `);
    jQuery("#chat-controls label").before(lang_html);
    jQuery("a.whisper-dialog").click(() => dialog.newDialog());
}