import {ProLayoutProps} from '@ant-design/pro-components';
import {DEFAULT_PATH, Route} from './routes';

/**
 * Props for Layout component
 */
export const LayoutProps: ProLayoutProps = {
  logo: undefined,
  title: '众包建图管理平台',
  route: Route,
  location: {
    pathname: DEFAULT_PATH,
  },
  menu: {
    collapsedShowGroupTitle: true,
  },
};
