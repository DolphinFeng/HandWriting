import { WebView } from 'react-native-webview'
import { BaseScript } from '../common/TTHelper'
import React from 'react'
import { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes'
import KNB from '@mrn/mrn-knb'
import { preStyle, openUrl, markHyperLink } from '@src/common/helpers/PreHtml'

interface IProps {
  html: string
  callBack?: (info) => void
}

interface IState {
  contentHeight: number
}

class HTMLDisplay extends React.Component<IProps, IState> {
  commentWeb: WebView

  constructor(props: Readonly<IProps>) {
    super(props)
    this.state = {
      contentHeight: 0
    }

    this.onMessage = this.onMessage.bind(this)
  }

  onMessage(event: WebViewMessageEvent) {
    try {
      const action = JSON.parse(event.nativeEvent.data)
      if (action.type === 'setHeight' && action.height > 0) {
        this.setState({ contentHeight: action.height })
      }
      if (action.type === 'clickImg' && action.currentSrc) {
        KNB.previewImage({
          current: action.currentSrc,
          urls: action.srcList || [action.currentSrc]
        })
      }
      if (action.type === 'clickHref') {
        let href = action.currentHref
        if (href) {
          openUrl(href)
        }
      }
    } catch (error) {
      console.warn('native & h5 error', error)
    }
  }

  getOuterHTML() {
    const script = `
    outerHtml = document.getElementById('desc');
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'setHTML',
      html:  document.body.innerHTML,
    }))
    true;
    `
    this.commentWeb.injectJavaScript(script)
  }

  addImages(url) {
    console.log('url ' + url)
    const script = `
    var img = '<br/><img src=${url} style="max-width: 200px;max-height: 200px;" /><br/>';
    document.execCommand('insertHTML', false, img)
    true;
    `
    this.commentWeb.injectJavaScript(script)
  }

  render() {
    let html = this.props.html
    html = markHyperLink(html)
    // html = ''.concat(
    //   '<meta name="viewport" content="initial-scale=1, user-scalable=no"/>',
    //   `<style>html{font-size: 14px; font-family: sans-serif;} body{margin: 0;} img{max-width: 100%;} span.mention{background: #edf0f7; border-radius: 2px; color: #333; padding: 3px 0;}</style>`,
    //   html,
    // )
    html = ''.concat(
      '<style>html{font-size: 14px; font-family: sans-serif;} body{margin: 0;} div{outline: none;} p {font-size: 14px !important;} img{max-width: 100%;max-height: 300px;} span.mention{background: #edf0f7; border-radius: 2px; color: #333; padding: 3px 0;}</style>',
      preStyle(html, 0)
    )

    return (
      <WebView
        containerStyle={{ height: this.state.contentHeight }}
        ref={view => {
          this.commentWeb = view
        }}
        originWhitelist={['*']}
        source={{ html, baseUrl: '' }}
        showsVerticalScrollIndicator={false}
        injectedJavaScript={BaseScript}
        automaticallyAdjustContentInsets
        decelerationRate="normal"
        scalesPageToFit={false}
        javaScriptEnabled // 仅限Android平台。iOS平台JavaScript是默认开启的
        scrollEnabled={false}
        onMessage={this.onMessage}
        mixedContentMode="always"
        onLoadEnd={() => {
          this.commentWeb.injectJavaScript(BaseScript)
        }}
      />
    )
  }
}

export default HTMLDisplay
