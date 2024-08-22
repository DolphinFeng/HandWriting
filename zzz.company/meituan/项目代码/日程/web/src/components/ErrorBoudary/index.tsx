import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import './index.less';

interface IErrorBoundaryState {
  error: any;
}

declare global {
  interface Window {
    Owl: any;
  }
}

/**
 * 错误边界
 */
class ErrorBoundary extends React.Component {
  state: IErrorBoundaryState;
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }

  indexTag = false;

  componentDidCatch(error) {
    if (this.indexTag === false) {
      this.indexTag = true;
      if (
        this.state.error === null
        || error.toString() !== this.state.error.toString()
      ) {
        this.setState(
          {
            error
          },
          () => {
            this.indexTag = false;
          }
        );
        window.Owl
          && window.Owl.addError(error, {
            level: 'error'
          });
      }
    }
  }
  render() {
    const { error } = this.state;
    const { children } = this.props;
    return error ? (
      <div className="no-data-page">
        <div className="no-data">
          <div className="no-data-content">
            <div className="no-data-content-icon">
              <img
                src={
                  'https://s3plus.sankuai.com/common-asserts/sad.png?AWSAccessKeyId=tzwrzkgkf2f5ndgg000000000063c81e&Expires=1869033954&Signature=MgE%2FL6%2Ft0L17auBuTMmMoS0uREs%3D'
                }
                className="no-data-img"
              />
            </div>
            <span className="no-data-content-tip">
              {i18nClient.t('error_boudary_load_failed', '加载失败')}
            </span>
            <span className="no-data-content-detail">
              <div className="ebundaryError">
                <div className="desc">
                  {i18nClient.t(
                    'error_boudary_please_refresh',
                    '资源加载失败，请点击刷新重试。'
                  )}
                </div>
                <div
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="reload-btn"
                >
                  {i18nClient.t('error_boudary_refresh', '刷新')}
                </div>
              </div>
            </span>
          </div>
        </div>
      </div>
    ) : (
      children
    );
  }
}
export default ErrorBoundary;
