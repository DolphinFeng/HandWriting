import axios from 'axios';
import {meshTolls} from '../../utils/meshTool/meshTools.js';
import {IssueMeta} from '../../system/issue/model.js';
import {parse as JSONParse} from 'lossless-json';

async function loadingIssueData(payload, issueServiceURL, tiles, issueMap) {
  if (tiles.length === 0) {
    return [];
  }

  try {
    const res = await axios.post(
      issueServiceURL + '/nio/material/issue/list-odd',
      {
        ...payload,
        meshIds: tiles,
      },
      {
        transformResponse: (data) => {
          if (typeof data === 'string') {
            try {
              data = JSONParse(data, (_key: string, value: any) => {
                if (value && value.isLosslessNumber) {
                  if (value.value.length < 19) {
                    return Number(value.value);
                  }

                  return value.value;
                }
                return value;
              });
            } catch (e) {
              /* Ignore */
              throw e;
            }
          }

          return data;
        },
      },
    );

    return (res.data as IssueMeta[]).filter((item) => {
      return !issueMap.has(item.id);
    });
  } catch (error) {
    throw new Error('loadingSourceIssueData -> axios.post 错误：' + error);
  }
}

export const issueTask = {
  async loadingSourceIssue(resolve, reject, args) {
    const tiles = meshTolls.intersectsTile(args['lbLon'], args['lbLat'], args['rtLon'], args['rtLat']),
      len = tiles.length,
      queue: Promise<IssueMeta[]>[] = [],
      result = [];

    let queueSize, tileLen;
    if (len <= 4) {
      queueSize = len;
      tileLen = 1;
    } else if (len <= 8) {
      queueSize = 4;
      tileLen = 2;
    } else {
      queueSize = 8;
      tileLen = Math.ceil(len / 8);
    }
    for (let i = 0; i < queueSize; i++) {
      queue.push(
        loadingIssueData(
          args.payload,
          args.issueServiceURL,
          tiles.slice(i * tileLen, i * tileLen + tileLen),
          args.issueMap,
        ),
      );
    }

    const responses = await Promise.allSettled(queue);

    let res: any[] = [];

    responses.forEach((response) => {
      if (response.status === 'fulfilled') {
        res = res.concat(response.value);
      }
    });

    resolve({
      request_uuid: args.payload.request_uuid,
      data: res,
    });
  },
};
