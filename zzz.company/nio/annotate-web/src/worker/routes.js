import {loadCrossJob} from './job/load-cross-range.js';
import {tileTask} from './job/tileDrawer.ts';

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

taskHandler.register('loadingSourceCrossTile', loadCrossJob.loadingSourceCrossTile);

taskHandler.register('getNDSTileImageUrl', tileTask.getNDSTileImageUrl);
