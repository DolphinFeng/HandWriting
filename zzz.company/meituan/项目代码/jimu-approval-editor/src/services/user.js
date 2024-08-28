import ajax, { searchAjax } from './ajax';

const bpmPrefix = '/approval/api/bpm';

// eslint-disable-next-line consistent-return
export async function getEmployee(name = '') {
  try {
    const data = await searchAjax.post(
      `${bpmPrefix}/service/bpm/dataset/rest_employee`,
      {
        filter: name,
        // 不要找离职人员
        quit: false,
        tenantId: 1
      }
    );

    if (data) {
      data.pageList = data.pageList.map((item) => {
        return {
          id: item.dataId,
          label: `${item.name} / ${item.code}`,
          value: item.dataId
        };
      });
      return data;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('[ajax error]', error);
  }
}

export async function getDept(deptName = '') {
  const data = await ajax.post(
    `${bpmPrefix}/service/bpm/dataset/rest_ape_factory_position_dept`,
    {
      filter: deptName,
      tenantId: 1
    }
  );

  data.pageList = data.pageList.map((item) => {
    return {
      id: item.dataId,
      label: item.seriesName,
      value: item.dataId
    };
  });
  return data;
}

export async function getBusiness() {
  return await ajax.get(`${bpmPrefix}/service/console/bpm/v2/auth-matter/tree`);
}
