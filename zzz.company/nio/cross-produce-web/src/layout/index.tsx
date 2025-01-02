import {ReactNode, useMemo, useState, useEffect} from 'react';
import {ConfigProvider, Dropdown} from 'antd';

import {MenuDataItem, PageContainer, ProConfigProvider, ProLayout} from '@ant-design/pro-components';
import {LayoutProps} from './layout_props';
import {LogoutOutlined} from '@ant-design/icons';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {getMatchMenu} from '../libs/umi';
import {SSO_DOMAIN_MAP} from '../services/sso-service';
import {useQuery} from '../hooks';

export const Layout = ({children, menuData}: {children?: ReactNode; menuData: MenuDataItem[]}) => {
  const loc = useLocation();
  const nav = useNavigate();
  const query = useQuery();

  const [titleName, setTitleName] = useState('');
  const [Domain, setDomain] = useState('');

  const handleMenuClick = (item: MenuDataItem) => {
    if (item.path) {
      nav(item.path);
    }
  };

  const matchMenus = useMemo(() => {
    query.forEach((value, key) => {
      if (['userName'].includes(key)) {
        setTitleName(value);
      }
    });
  
    const matchMenus = getMatchMenu(loc.pathname || '/', menuData, true);
    return matchMenus;
  }, [loc.pathname, menuData]);

  const {matchMenuKeys, matchPathName} = useMemo(() => {
    const matchMenuKeys = Array.from(new Set(matchMenus.map((item) => item.key || item.path || '')));
    const matchPathName = matchMenus[matchMenus.length - 1]?.path;
    return {
      matchMenuKeys,
      matchPathName,
    };
  }, [matchMenus]);

  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((prev: any, curr: any) => {
      const [k, v] = curr.split('=');
      prev[k.trim()] = v;
      return prev;
    }, {});
    var title = cookies['userName4Cross'];
    setTitleName(title);
  }, []);

  function loginout() {
    document.cookie = 'userToken4Cross=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.nioint.com';
    document.cookie = 'userName4Cross=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.nioint.com';
    let prefix = SSO_DOMAIN_MAP[window.location.hostname];
    let hostname = window.location.hostname;
    var urlpart =
      prefix + 'oauth2/authorize?client_id=101817&redirect_uri=http://' + hostname + '/%23/login&response_type=code';
    var url = encodeURIComponent(urlpart);
    window.location.href = prefix + 'logout?service=' + url;
   
  }

  return (
    <ProConfigProvider hashed>
      <ConfigProvider>
        <ProLayout
          layout="mix"
          prefixCls="dimension"
          bgLayoutImgList={[
            {
              src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
              left: 85,
              bottom: 100,
              height: '303px',
            },
          ]}
          {...LayoutProps}
          avatarProps={{
            src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
            size: 'small',
            title: titleName,
            render: (props, dom) => {
              return (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'logout',
                        icon: <LogoutOutlined />,
                        label: <a onClick={loginout}>退出登录</a>,
                      },
                    ],
                  }}
                >
                  {dom}
                </Dropdown>
              );
            },
          }}
          siderMenuType="sub"
          actionsRender={(props) => {
            if (props.isMobile) return [];
            if (typeof window === 'undefined') return [];
            return [<>action </>];
          }}
          onPageChange={(location) => {
          }}
          menuItemRender={(item, dom) => <div onClick={() => handleMenuClick(item)}>{dom}</div>}
          location={{
            pathname: matchPathName,
          }}
        >
          <PageContainer>
            <Outlet></Outlet>
          </PageContainer>
        </ProLayout>
      </ConfigProvider>
    </ProConfigProvider>
  );
};
