export const data = [
  {
    type: 'Start',
    option: {},
    resourceId: 'sid-268A41A8-069C-4B68-9A3D-9F16CD860E9B'
  },
  {
    type: 'Task',
    option: {},
    resourceId: 'sid-268A41A8-069C-4B68-9A3D-9F16CD860E9B1'
  },
  {
    type: 'Gateway',
    option: {},
    resourceId: 'sid-268A41A8-069C-4B68-9A3D-9F16CD860E9B2',
    child: [
      {
        type: 'branch',
        child: [
          {
            type: 'Condition',
            option: {},
            resourceId: 'sid-268A41A8-069C-4B68-9A3D-9F16CD860E9B3'
          },
          {
            type: 'Task',
            option: {},
            resourceId: 'sid-268A41A8-069C-4B68-9A3D-9F16CD860E9B4'
          }
        ]
      },
      {
        type: 'branch',
        child: [
          {
            type: 'Condition',
            option: {
              title: '默认',
              default: true
            },
            resourceId: 'sid-268A41A8-069C-4B68-9A3D-9F16CD860E9B5'
          },
          {
            type: 'Task',
            option: {},
            resourceId: 'sid-268A41A8-069C-4B68-9A3D-9F16CD860E9B6'
          }
        ]
      }
    ]
  },
  {
    type: 'Task',
    option: {},
    resourceId: 'sid-268A41A8-069C-4B68-9A3D-9F16CD860E9B7'
  },
  {
    type: 'End',
    option: {},
    resourceId: 'sid-268A41A8-069C-4B68-9A3D-9F16CD860E9B8'
  }
];
