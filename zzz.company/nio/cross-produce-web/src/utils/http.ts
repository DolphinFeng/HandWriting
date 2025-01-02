/**
 * 获取请求的 offset
 * @param page
 * @param limit
 * @returns
 */
export function getQueryOffset(page?: number, limit?: number) {
  if (page === undefined || limit === undefined) {
    return 0;
  }

  return limit * (page * 1 - 1);
}
