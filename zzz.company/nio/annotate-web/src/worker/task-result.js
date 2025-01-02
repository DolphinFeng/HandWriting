export class TaskResult {
  constructor(code, msg, data) {
      this.code = code;
      this.msg = msg;
      this.data = data;
  }
}

//任务类型
export const PollTaskResult = {
  'SUCCESS': 200,
  'START_NEW': 300,
  'FAIL': 500,
};
