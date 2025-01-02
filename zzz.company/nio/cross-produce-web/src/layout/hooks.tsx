import {MenuDataItem} from '@ant-design/pro-components';
import {LayoutProps} from './layout_props';
import {RouteObject, Navigate} from 'react-router-dom';

export const useReactRoutes = () => {
  const route = LayoutProps.route as MenuDataItem;

  function loop(menu_meta: MenuDataItem) {
    const path = menu_meta?.path ?? '/';

    let items: RouteObject[] = [
      {
        path,
        element: menu_meta?.component,
      },
    ];

    if (path && menu_meta?.component) {
      items = [
        {
          path,
          element: menu_meta?.component,
        },
      ];
    }

    for (const rou of menu_meta.routes ?? []) {
      const sub_route_items = loop(rou ?? {});
      if (sub_route_items.length > 0) {
        items = items.concat(sub_route_items);
      }
    }

    return items;
  }

  let routes = loop(route ?? {});

  routes = routes.filter((item) => {
    return Boolean(item.path) && Boolean(item.element);
  });

  routes.push({
    path: '*',
    element: <Navigate to="/welcome" replace />,
  });

  return routes;
};

export const useHashReactRoutes = () => {
  const route = LayoutProps.route as MenuDataItem;

  function loop(menu_meta: MenuDataItem) {
    const path = menu_meta?.path ?? '/';

    let items: RouteObject[] = [
      {
        path,
        element: menu_meta?.component,
      },
    ];

    if (path && menu_meta?.component) {
      items = [
        {
          path,
          element: menu_meta?.component,
        },
      ];
    }

    for (const rou of menu_meta.routes ?? []) {
      const sub_route_items = loop(rou ?? {});
      if (sub_route_items.length > 0) {
        items = items.concat(sub_route_items);
      }
    }

    return items;
  }

  let routes = loop(route ?? {});

  routes = routes.filter((item) => {
    return Boolean(item.path) && Boolean(item.element);
  });

  routes.push({
    path: '*',
    element: <Navigate to="/welcome" replace />,
  });

  return routes;
};
