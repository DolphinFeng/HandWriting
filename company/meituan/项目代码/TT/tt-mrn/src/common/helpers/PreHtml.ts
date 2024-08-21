import { Platform } from '@mrn/react-native'
import MRNUtils from '@mrn/mrn-utils'
import KNB from '@mrn/mrn-knb'
import linkifyHtml from 'linkifyjs/html'

export function markHyperLink(htmlString) {
  return linkifyHtml(htmlString, {
    target: '_blank',
    validate: {
      url: function (value) {
        return /^(http|ftp)s?:\/\//.test(value)
      }
    }
  })
}

export const defaultViewportMeta =
  '<meta name="viewport" content="initial-scale=1, user-scalable=no"/>'

export const defaultStyleSheet =
  '<style type="text/css">' +
  'body{margin:0;padding:0;font-size:16px;font-family:sans-serif;line-height:1.3;}' +
  '</style>'

function filterHtml(html: string) {
  return html
    .replace(new RegExp('alert', 'gm'), '<code>alert</code>')
    .replace(new RegExp('<p><br></p>', 'gm'), '')
}

const setupEventListenerScript = `<script>
  function ResizeImages(){
    function _postMessage() {
      if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
        window.ReactNativeWebView.postMessage.apply(window.ReactNativeWebView, arguments);
      } else if (typeof window.postMessage === 'function') {
        window.postMessage.apply(window, arguments);
      } else {
        console.error('no postMessage support')
      }
    }
    for(i=0;i <document.images.length;i++){
      const img = document.images[i]
      img.addEventListener('click', function(){
        _postMessage(JSON.stringify({type: 'clickImg', currentSrc: img.src, srcList: Array.prototype.slice.call(document.images).map(it => it.src)}));
      });
    }
    var aLink = document.getElementsByTagName('a')
    for ( j=0; j<aLink.length; j++) {
      const aTmp = aLink[j]
      const originalHref = aTmp.href
      aTmp.href='javascript:'
      aTmp.target=''
      aTmp.addEventListener('click',function(){
        _postMessage(JSON.stringify({type:'clickHref', currentHref: originalHref}));
      });
    }
  }
  window.onload=function(){
    ResizeImages()
  }
</script>`

export const preStyle = (html, relWidth) => {
  if (!html) {
    return null
  }

  return ''.concat(
    defaultViewportMeta,
    defaultStyleSheet,
    filterHtml(html),
    setupEventListenerScript
  )
}

export function openUrl(url) {
  if (Platform.OS === 'ios') {
    MRNUtils.openUrl(url)
  } else {
    KNB.openPage({
      url: url,
      query: {
        _knbopeninapp: 1
      }
    })
  }
}
