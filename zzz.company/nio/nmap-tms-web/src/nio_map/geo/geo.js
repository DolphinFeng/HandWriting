import bboxClip from '@turf/bbox-clip';
import centerOfMass from '@turf/center-of-mass';
import { polygon } from '@turf/helpers';

export function lon2tile(lon, zoom) {
  return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
}

export function lat2tile(lat, zoom) {
  return (
    Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI)
    / 2 * Math.pow(2, zoom)));
}

export function tile2lon(x, z) {
  return (x / Math.pow(2, z) * 360 - 180);
}

export function tile2lat(y, z) {
  const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
  return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
}

// 获取polygon和矩形bound相交区域的中心
export function getClipedCenter(locs, bounds) {
  const len = locs.length;
  if (len === 0) return [];
  const areaPolygon = polygon([locs]);
  const { _northEast, _southWest } = bounds;
  const boundsBox = [_southWest.lat, _southWest.lng, _northEast.lat, _northEast.lng];
  const cliped = bboxClip(areaPolygon, boundsBox);
  if (cliped.geometry.coordinates.length === 0) return [];
  const center = centerOfMass(cliped);
  return center.geometry.coordinates;
}

export function getCenter(locs) {
  const len = locs.length;
  if (len === 0) return [];
  const areaPolygon = polygon([locs]);
  const center = centerOfMass(areaPolygon);
  return center.geometry.coordinates;
}
