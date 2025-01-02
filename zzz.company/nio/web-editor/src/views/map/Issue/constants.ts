export const ISSUE_NOTIFY_TYPE_LIST = [1, 100, 101, 102];

export const ISSUE_STATUS_LIST = ['Normal', 'MissIssueFile', 'MissLocFile', 'DataError'];

export enum ISSUE_ENV {
  PROD = 'Prod',
  STG = 'Stg',
}

export const ISSUE_ENV_LIST = [ISSUE_ENV.PROD, ISSUE_ENV.STG];

export enum ISSUE_CONDITION_TYPE {
  ISSUE_NOTIFY_TYPE = 'issue_notify_type',
  ISSUE_STATUS = 'issue_status',
  ISSUE_ENV = 'issue_env',
}
