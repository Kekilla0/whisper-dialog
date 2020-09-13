import * as dialog from './dialog.js';

export function renderWhisperIcon() {
    const lang_html = $(`
    <a class="button whisper-dialog" title="whisper selected players">
            <i class="fas fa-user-secret"></i>
    </a>
    `);
    jQuery(".roll-type-select label").before(lang_html);
    jQuery("a.whisper-dialog").click(() => dialog.newDialog());
    jQuery("select[name=rollMode]").css('width', '170px');
}