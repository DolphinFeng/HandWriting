export function bugfixForRoomsUrl(locationUrl: any) {
  return typeof locationUrl === 'string' ? locationUrl.replace('sankuai.com//huiyi/#/map', 'sankuai.com/huiyi/#/map') : null;
}
