// 提醒类型
export enum EAllDayNoticeRule {
  '不提醒' = '0',
  '当天9:00' = '1',
  '1天前9:00' = '2',
  '2天前9:00' = '3',
  '1周前9:00' = '4'
}

// 提醒类型
export enum ENoticeRule {
  '不提醒' = '0',
  '日程开始时' = 'P0Y0M0DT0H0M0S',
  '5分钟前' = 'P0Y0M0DT0H5M0S',
  '10分钟前' = 'P0Y0M0DT0H10M0S',
  '15分钟前' = 'P0Y0M0DT0H15M0S',
  '30分钟前' = 'P0Y0M0DT0H30M0S',
  '1小时前' = 'P0Y0M0DT1H0M0S',
  '1天前' = 'P0Y0M1DT0H0M0S'
}
