export let projectForm = {
  id: '',
  name: '',
  productLine: '',
  createBy: '',
  remark: '',
  status: '',
  createTimeFrom: '',
  createTimeTo: '',
  startTimeFrom: '',
  startTimeTo: '',
  endTimeFrom: '',
  endTimeTo: '',
};

export let stateForm = [
  {
    value:1,
    label:'未启动'
  },
  {
    value:2,
    label:'执行中'
  },
  {
    value:3,
    label:'执行失败'
  },
  {
    value:4,
    label:'已取消'
  },
  {
    value:5,
    label:'终止'
  },
  {
    value:6,
    label:'正常结束'
  },
  {
    value:7,
    label:'已归档'
  },

]