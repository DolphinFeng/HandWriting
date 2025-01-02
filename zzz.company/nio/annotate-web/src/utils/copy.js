import { ElMessage } from 'element-plus';
import { NioMessage } from './utils.js';

/**
 * 复制文字到粘贴板
 * @type {(function(String, String, Number): Promise<void>)|*}
 */
export const copyTextToClipboard = (function () {
  function oldCopyTextToClipboard(text) {
    let textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.classList.add('text-copy-board');
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      let res = document.execCommand('copy');
      document.body.removeChild(textarea);
      return res;
    } catch (e) {
      return e;
    }
  }
  return async function (
    text,
    title = '已将内容复制到粘贴板',
    duration = 1000
  ) {
    let result;
    if (!navigator.clipboard) {
      result = oldCopyTextToClipboard(text);
    } else {
      await navigator.clipboard
        .writeText(text)
        .then((res) => {
          result = true;
        })
        .catch((e) => {
          result = e;
        });
    }
    if (result === true) {
      NioMessage('success', title, duration);
    } else {
      NioMessage('warning', '您的浏览器不支持复制');
    }
    document.body.click();
  };
})();
