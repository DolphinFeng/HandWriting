// @ts-nocheck
import React from 'react';
import { ApplyPluginsType } from '/Users/dolphin/Desktop/Codespace/jimu-approval-editor/node_modules/@umijs/runtime';
import * as umiExports from './umiExports';
import { plugin } from './plugin';

export function getRoutes() {
  const routes = [
  {
    "path": "/approval/admin/sso/callback",
    "exact": true
  },
  {
    "path": "/",
    "component": require('/Users/dolphin/Desktop/Codespace/jimu-approval-editor/src/layout').default,
    "routes": [
      {
        "path": "/approval/admin",
        "component": require('/Users/dolphin/Desktop/Codespace/jimu-approval-editor/src/pages/index').default,
        "exact": true
      },
      {
        "path": "/approval/admin/create",
        "component": require('/Users/dolphin/Desktop/Codespace/jimu-approval-editor/src/pages/create').default,
        "exact": true
      },
      {
        "path": "/approval/admin/create-tripartite",
        "component": require('/Users/dolphin/Desktop/Codespace/jimu-approval-editor/src/pages/create-tripartite/index.tsx').default,
        "exact": true
      },
      {
        "path": "/no-permisson",
        "component": require('/Users/dolphin/Desktop/Codespace/jimu-approval-editor/src/pages/noPermission').default,
        "exact": true
      },
      {
        "path": "/approval/admin/batch-transform",
        "component": require('/Users/dolphin/Desktop/Codespace/jimu-approval-editor/src/pages/tools/batch-transform/index.tsx').default,
        "exact": true
      },
      {
        "path": "/*",
        "component": require('/Users/dolphin/Desktop/Codespace/jimu-approval-editor/src/pages/page404').default,
        "exact": true
      }
    ]
  }
];

  // allow user to extend routes
  plugin.applyPlugins({
    key: 'patchRoutes',
    type: ApplyPluginsType.event,
    args: { routes },
  });

  return routes;
}
