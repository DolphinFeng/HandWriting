import ajax from './ajax';

const EXPORT_RECORDS_QUERY = '/service/export/searchAndExport';
const SEARCH_RECORDS_QUERY = '/service/export/records';

export async function exportRecords(params) {
  return await ajax.post(EXPORT_RECORDS_QUERY, params);
}

export async function searchRecords(params) {
  return await ajax.get(SEARCH_RECORDS_QUERY, params);
}

export { EXPORT_RECORDS_QUERY, SEARCH_RECORDS_QUERY };
