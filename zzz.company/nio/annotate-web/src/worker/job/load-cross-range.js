import axios from 'axios';

async function loadCrossDataInRange(url, payload, crossIdMap) {
  try {
    const res = await axios.post(url, {
      //ndsVersion: payload.ndsVersion,
      //level: payload.level,
      //hasEvent: payload.hasEvent,
      leftTopX: payload.leftBottomX,
      rightBottomY: payload.leftBottomY,
      rightBottomX: payload.rightTopX,
      leftTopY: payload.rightTopY,
    });

    if (res.data.code != 200) {
      throw new Error(res.data.data.message);
    }

    return res.data.data.filter((item) => {
      return !crossIdMap.has(item.projectId + '_' + item.crossId);
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

export const loadCrossJob = {
  async loadingSourceCrossTile(resolve, reject, args) {
    const queue = [];

    queue.push(loadCrossDataInRange(args.url, args.payload, args.crossIdMap));

    const responses = await Promise.allSettled(queue);
    let res = [];

    responses.forEach((response) => {
      if (response.status === 'fulfilled') {
        res = res.concat(response.value);
      } else {
        reject({data: response.reason.message + ''});
      }
    });

    resolve({
      data: res,
    });
  },
};
