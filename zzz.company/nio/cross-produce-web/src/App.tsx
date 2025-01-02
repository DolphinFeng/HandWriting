import './App.css';
import {Layout} from './layout';
import {Routes, HashRouter, Route, Navigate} from 'react-router-dom';
import {useMemo} from 'react';
import {getMenuData} from '@ant-design/pro-components';
import {LayoutProps} from './layout/layout_props';
import {getFlatMenus} from './libs/umi';
import axios from 'axios';
axios.defaults.withCredentials=true
function App() {
  const {breadcrumb, menuData} = useMemo(() => {
    return getMenuData(LayoutProps.route?.routes, {locale: false}, undefined, undefined) ?? [];
  }, []);

  const flet_menu = getFlatMenus(menuData);

  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route element={<Layout menuData={menuData}></Layout>}>
            {Object.values(flet_menu).map((item) => {
              return <Route key={item.key} path={item.path} element={item.component}></Route>;
            })}
          </Route>
          <Route path="*" element={<Navigate to="/project-management/batch/list" replace></Navigate>}></Route>
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
