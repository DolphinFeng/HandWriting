import {oddTask} from './controller/oddTask.js';
import {issueTask} from './controller/issueTask.ts';
import {nadTileTask} from './controller/nadTileTask.ts';
import {tileTask} from './controller/tileDrawer.ts';

export const taskHandler = {
  list: {},
  register(type, handler) {
    this.list[type] = handler;
    return this;
  },
  dispatch(type, args) {
    return new Promise((resolve, reject) => {
      return this.list[type](resolve, reject, args);
    });
  },
};

taskHandler
  .register('loadingSourceOdd', oddTask.loadingSourceOdd)
  .register('loadingWorkOdd', oddTask.loadingWorkOdd)
  .register('loadingTrajectory', oddTask.loadingTrajectory);

taskHandler.register('loadingSourceIssue', issueTask.loadingSourceIssue);

taskHandler.register('loadingSourceNadTile', nadTileTask.loadingSourceNadTile);

taskHandler.register('getNDSTileImageUrl', tileTask.getNDSTileImageUrl);
