import { i18nClient } from '@sailor/i18n-mrn'
import { WebView } from 'react-native-webview'
import { BaseScript } from '../../common/TTHelper'
import React from 'react'
import { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes'
import KNB from '@mrn/mrn-knb'
import { preStyle, openUrl } from '@src/common/helpers/PreHtml'

const observeContentMutationScript = `
(function () {
  const targetNode = document.getElementById('desc');
  if (!targetNode) return;
  const config = {characterData: true, childList: true, subtree: true};
  const observer = new MutationObserver(function (mutationsList, observer) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'contentMutated'
    }));
  });
  observer.observe(targetNode, config);
})();
`

// only works on iOS
const focusInputScript = `
(function() {
  document.getElementById('desc').focus();
})();
`

// html 编辑
// 输入是pure html， 输出也是pure html ，不包含style、script等
interface IProps {
  html: string
  callBack?: (info) => void
  onContentMutated?: () => void
}

interface IState {
  contentHeight: number
}

class HtmlEditor extends React.Component<IProps, IState> {
  commentWeb: WebView

  constructor(props: Readonly<IProps>) {
    super(props)
    this.state = {
      contentHeight: 0,
    }

    this.onMessage = this.onMessage.bind(this)
  }

  onMessage(event: WebViewMessageEvent) {
    try {
      const action = JSON.parse(event.nativeEvent.data)
      if (action.type === 'setHTML' && action.html) {
        console.log('new html ' + action.html)
        this.props.callBack && this.props.callBack(action.html)
      }

      if (action.type === 'clickImg' && action.currentSrc) {
        KNB.previewImage({
          current: action.currentSrc,
          urls: action.srcList || [action.currentSrc],
        })
      }
      if (action.type === 'clickHref') {
        let href = action.currentHref
        if (href) {
          openUrl(href)
        }
      }
      if (action.type === 'contentMutated') {
        this.props.onContentMutated && this.props.onContentMutated()
      }
    } catch (error) {
      console.warn('native & h5 error', error)
    }
  }

  getOuterHTML() {
    const script = `
    container = document.getElementById('desc');
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'setHTML',
      html:  container.innerHTML,
    }))
    true;
    `
    this.commentWeb?.injectJavaScript(script)
  }

  blur() {
    const script = `
    (function() {
      document.activeElement && document.activeElement.blur()
    })()
    `
    this.commentWeb?.injectJavaScript(script)
  }

  addImages(url) {
    console.log('url ' + url)
    const script =
      focusInputScript +
      `
    var img = '<br/><img src=${url} /><br/>';
    document.execCommand('insertHTML', false, img);
    true;
    `
    this.commentWeb?.injectJavaScript(script)
  }

  render() {
    const editableDesc = ''.concat(
      '<meta name="viewport" content="initial-scale=1,user-scalable=no">',
      `<style type="text/css">body{margin:0;padding:20px 16px 20px 16px;font-size:16px; line-height:1.3;font-family: sans-serif;}div{outline: none;}#desc{min-height: 200vh;}#desc:empty:not(:focus):before{content:"${i18nClient.t('component_click_edit', { defaultValue: '点击编辑' })}"; color: rgba(0,0,0,0.36);}#desc img{max-width:100%;max-height:380px;width:auto;}</style>`,
      `<div contenteditable="true" id="desc">${this.props.html}</div>`,
    )
    const scriptToInject = observeContentMutationScript + focusInputScript + BaseScript

    return (
      <WebView
        ref={view => {
          this.commentWeb = view
        }}
        originWhitelist={['*']}
        source={{ html: editableDesc, baseUrl: '' }}
        showsVerticalScrollIndicator={true}
        injectedJavaScript={scriptToInject}
        automaticallyAdjustContentInsets
        decelerationRate="normal"
        scalesPageToFit={false}
        keyboardDisplayRequiresUserAction={false}
        javaScriptEnabled // 仅限Android平台。iOS平台JavaScript是默认开启的
        scrollEnabled={true}
        onMessage={this.onMessage}
        mixedContentMode="always"
      />
    )
  }
}

export default HtmlEditor
