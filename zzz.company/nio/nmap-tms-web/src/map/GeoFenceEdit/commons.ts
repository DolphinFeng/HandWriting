import { Math as CMath, Cartesian3 } from "cesium";
import WKT from "terraformer-wkt-parser";

export function convertToLatLng(s: string) {
  const match = s.match(/(-?\d+\.\d+)/g);
  
  if (match && match.length === 2) {
      return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[0])
      };
  }

  return null;
}

export function isValidLatLng(s: string) {
  const regex = /^\(-?\d{1,3}\.\d+,-?\d{1,3}\.\d+\)$/;
  return regex.test(s);
}

export function parseWKTToGeo(wktString: string): { type: "" | "Polygon" | "MultiPolygon" | "LineString", coordinates: any[] } {
  const empty = {
    type: "" as "",
    coordinates: []
  };

  let geometry: any = null;
  try {
    geometry = WKT.parse(wktString);  
  } catch (error) {
    return empty;
  }
  
  let dirgeo: GeoJSON.Polygon | GeoJSON.MultiPolygon | GeoJSON.LineString | undefined; 
  if (typeof geometry['coordinates'] !== 'undefined') {
    dirgeo = geometry;
  } else {
    return empty;
  }
  if (!dirgeo?.coordinates || dirgeo.coordinates.length == 0) {
    return empty;
  }
  if (typeof dirgeo.coordinates[0] == 'number') {
    return empty;
  }
  
  //将多边形绘制到this.viewer上
  let coordinates = [];
  if (dirgeo.type === 'MultiPolygon') {
    coordinates = dirgeo.coordinates[0][0];
  } else if (dirgeo.type === 'Polygon') {
    coordinates = dirgeo.coordinates[0];
  } else if (dirgeo.type === 'LineString') {
    coordinates = dirgeo.coordinates;
  }
  
  return {
    type: dirgeo.type,
    coordinates
  };
}