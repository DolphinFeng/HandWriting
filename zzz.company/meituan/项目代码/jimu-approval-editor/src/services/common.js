import ajax from './ajax';

export async function fetchDataService(url, params) {
  return ajax.get(url, params);
}

export async function postActionService(url, params) {
  return ajax.post(url, params);
}

export async function postFormService(url, params) {
  return ajax.postForm(url, params);
}
