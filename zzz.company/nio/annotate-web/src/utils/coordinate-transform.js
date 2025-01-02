let kSemimajorAxis = 6378137.0;
let kSemiminorAxis = 6356752.3142;
let kRatioMinusMajor = (kSemimajorAxis - kSemiminorAxis) / kSemimajorAxis;
let kEccentricitySquared = kRatioMinusMajor * (2 - kRatioMinusMajor);

function Rad2Deg(rad) {
  return (rad / Math.PI) * 180.0;
}

function Deg2Rad(deg) {
  return (deg / 180.0) * Math.PI;
}

export function GeodeticToECEF(lon, lat, height) {
  let lamb = Deg2Rad(lat);
  let phi = Deg2Rad(lon);
  let s = Math.sin(lamb);
  let N = kSemimajorAxis / Math.sqrt(1 - kEccentricitySquared * s * s);
  let sin_lambda = Math.sin(lamb);
  let cos_lambda = Math.cos(lamb);
  let sin_phi = Math.sin(phi);
  let cos_phi = Math.cos(phi);

  let result = {};

  result.x = (height + N) * cos_lambda * cos_phi;
  result.y = (height + N) * cos_lambda * sin_phi;
  result.z = (height + (1 - kEccentricitySquared) * N) * sin_lambda;

  return result;
}

export function ECEFToENU(x, y, z, ref_lon, ref_lat, ref_height) {
  let result = {};

  let lamb = Deg2Rad(ref_lat);
  let phi = Deg2Rad(ref_lon);
  let s = Math.sin(lamb);
  let N = kSemimajorAxis / Math.sqrt(1 - kEccentricitySquared * s * s);
  let sin_lambda = Math.sin(lamb);
  let cos_lambda = Math.cos(lamb);
  let sin_phi = Math.sin(phi);
  let cos_phi = Math.cos(phi);
  let x0 = (ref_height + N) * cos_lambda * cos_phi;
  let y0 = (ref_height + N) * cos_lambda * sin_phi;
  let z0 = (ref_height + (1 - kEccentricitySquared) * N) * sin_lambda;
  let xd = x - x0;
  let yd = y - y0;
  let zd = z - z0;
  let t = -cos_phi * xd - sin_phi * yd;
  result.xEast = -sin_phi * xd + cos_phi * yd;
  result.yNorth = t * sin_lambda + cos_lambda * zd;
  result.zUp =
    cos_lambda * cos_phi * xd + cos_lambda * sin_phi * yd + sin_lambda * zd;

  return result;
}

export function GeodeticToENU(lon, lat, height, ref_lon, ref_lat, ref_height) {
  let result0 = GeodeticToECEF(lon, lat, height);
  let result1 = ECEFToENU(
    result0.x,
    result0.y,
    result0.z,
    ref_lon,
    ref_lat,
    ref_height
  );

  return result1;
}

export function ENUToECEF(xEast, yNorth, zUp, ref_lon, ref_lat, ref_height) {
  let lamb = Deg2Rad(ref_lat);
  let phi = Deg2Rad(ref_lon);
  let s = Math.sin(lamb);
  let N = kSemimajorAxis / Math.sqrt(1 - kEccentricitySquared * s * s);
  let sin_lambda = Math.sin(lamb);
  let cos_lambda = Math.cos(lamb);
  let sin_phi = Math.sin(phi);
  let cos_phi = Math.cos(phi);
  let x0 = (ref_height + N) * cos_lambda * cos_phi;
  let y0 = (ref_height + N) * cos_lambda * sin_phi;
  let z0 = (ref_height + (1 - kEccentricitySquared) * N) * sin_lambda;
  let t = cos_lambda * zUp - sin_lambda * yNorth;
  let zd = sin_lambda * zUp + cos_lambda * yNorth;
  let xd = cos_phi * t - sin_phi * xEast;
  let yd = sin_phi * t + cos_phi * xEast;

  let result = {};

  result.ecef_x = xd + x0;
  result.ecef_y = yd + y0;
  result.ecef_z = zd + z0;

  return result;
}

export function ECEFToGeodetic(x, y, z) {
  let x2 = x * x;
  let y2 = y * y;
  let z2 = z * z;
  let a = kSemimajorAxis;
  let b = kSemiminorAxis;
  let e = Math.sqrt(1 - Math.pow(b / a, 2));
  let b2 = b * b;
  let e2 = e * e;
  let ep = e * (a / b);
  let r = Math.sqrt(x2 + y2);
  let r2 = r * r;
  let E2 = a * a - b * b;
  let F = 54.0 * b2 * z2;
  let G = r2 + (1 - e2) * z2 - e2 * E2;
  let c = (e2 * e2 * F * r2) / (G * G * G);
  let s = Math.pow(1 + c + Math.sqrt(c * c + 2 * c), 1 / 3.0);
  let P = F / (3 * Math.pow(s + 1 / s + 1, 2) * G * G);
  let Q = Math.sqrt(1 + 2.0 * e2 * e2 * P);
  let ro =
    -(P * e2 * r) / (1 + Q) +
    Math.sqrt(
      ((a * a) / 2.0) * (1 + 1 / Q) -
        (P * (1 - e2) * z2) / (Q * (1 + Q)) -
        (P * r2) / 2.0
    );
  let tmp = Math.pow(r - e2 * ro, 2.0);
  let U = Math.sqrt(tmp + z2);
  let V = Math.sqrt(tmp + (1 - e2) * z2);
  let zo = (b2 * z) / (a * V);
  let height = U * (1 - b2 / (a * V));
  let lat = Math.atan((z + ep * ep * zo) / r);
  let temp = Math.atan(y / x);
  let lon;
  if (x >= 0) {
    lon = temp;
  } else if ((x < 0) & (y >= 0)) {
    lon = Math.PI + temp;
  } else {
    lon = temp - Math.PI;
  }

  let result = {};

  result.lat = Rad2Deg(lat);
  result.lon = Rad2Deg(lon);
  result.h = height;

  return result;
}

export function ENUToGeodetic(x, y, z, ref_lon, ref_lat, ref_height) {
  let { ecef_x, ecef_y, ecef_z } = ENUToECEF(
    x,
    y,
    z,
    ref_lon,
    ref_lat,
    ref_height
  );
  return ECEFToGeodetic(ecef_x, ecef_y, ecef_z);
}

export function ENU2UV(east, north, ox, oy, scale_x, scale_y) {
  let result = {};

  result.u = (east - ox) / scale_x;
  result.v = (north - oy) / scale_y;

  return result;
}

export function UV2ENU(u, v, ox, oy, scale_x, scale_y) {
  let east = u * scale_x + ox;
  let north = v * scale_y + oy;

  return { east, north };
}

function makeTFrom6Dof(rx, ry, rz, tx, ty, tz) {
  const matT = Array.from({ length: 16 }, (_, i) => (i % 5 === 0 ? 1 : 0));
  const rvec = [rx, ry, rz];
  const len = Math.sqrt(rvec.reduce((sum, val) => sum + val * val, 0));
  const axis = rvec.map((val) => val / len);
  const angle = len;
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);

  matT[0] = cosAngle + axis[0] * axis[0] * (1 - cosAngle);
  matT[4] = axis[0] * axis[1] * (1 - cosAngle) - axis[2] * sinAngle;
  matT[8] = axis[0] * axis[2] * (1 - cosAngle) + axis[1] * sinAngle;

  matT[1] = axis[1] * axis[0] * (1 - cosAngle) + axis[2] * sinAngle;
  matT[5] = cosAngle + axis[1] * axis[1] * (1 - cosAngle);
  matT[9] = axis[1] * axis[2] * (1 - cosAngle) - axis[0] * sinAngle;

  matT[2] = axis[2] * axis[0] * (1 - cosAngle) - axis[1] * sinAngle;
  matT[6] = axis[2] * axis[1] * (1 - cosAngle) + axis[0] * sinAngle;
  matT[10] = cosAngle + axis[2] * axis[2] * (1 - cosAngle);

  matT[12] = tx;
  matT[13] = ty;
  matT[14] = tz;

  return matT;
}

function determinant(rhs) {
  const _3142_3241 = rhs[8] * rhs[13] - rhs[9] * rhs[12];
  const _3143_3341 = rhs[8] * rhs[14] - rhs[10] * rhs[12];
  const _3144_3441 = rhs[8] * rhs[15] - rhs[11] * rhs[12];
  const _3243_3342 = rhs[9] * rhs[14] - rhs[10] * rhs[13];
  const _3244_3442 = rhs[9] * rhs[15] - rhs[11] * rhs[13];
  const _3344_3443 = rhs[10] * rhs[15] - rhs[11] * rhs[14];

  return (
    rhs[0] * (rhs[5] * _3344_3443 - rhs[6] * _3244_3442 + rhs[7] * _3243_3342) -
    rhs[1] * (rhs[4] * _3344_3443 - rhs[6] * _3144_3441 + rhs[7] * _3143_3341) +
    rhs[2] * (rhs[4] * _3244_3442 - rhs[5] * _3144_3441 + rhs[7] * _3142_3241) -
    rhs[3] * (rhs[4] * _3243_3342 - rhs[5] * _3143_3341 + rhs[6] * _3142_3241)
  );
}

function inverse(rhs) {
  const _2132_2231 = rhs[4] * rhs[9] - rhs[5] * rhs[8];
  const _2133_2331 = rhs[4] * rhs[10] - rhs[6] * rhs[8];
  const _2134_2431 = rhs[4] * rhs[11] - rhs[7] * rhs[8];
  const _2142_2241 = rhs[4] * rhs[13] - rhs[5] * rhs[12];
  const _2143_2341 = rhs[4] * rhs[14] - rhs[6] * rhs[12];
  const _2144_2441 = rhs[4] * rhs[15] - rhs[7] * rhs[12];
  const _2233_2332 = rhs[5] * rhs[10] - rhs[6] * rhs[9];
  const _2234_2432 = rhs[5] * rhs[11] - rhs[7] * rhs[9];
  const _2243_2342 = rhs[5] * rhs[14] - rhs[6] * rhs[13];
  const _2244_2442 = rhs[5] * rhs[15] - rhs[7] * rhs[13];
  const _2334_2433 = rhs[6] * rhs[11] - rhs[7] * rhs[10];
  const _2344_2443 = rhs[6] * rhs[15] - rhs[7] * rhs[14];
  const _3142_3241 = rhs[8] * rhs[13] - rhs[9] * rhs[12];
  const _3143_3341 = rhs[8] * rhs[14] - rhs[10] * rhs[12];
  const _3144_3441 = rhs[8] * rhs[15] - rhs[11] * rhs[12];
  const _3243_3342 = rhs[9] * rhs[14] - rhs[10] * rhs[13];
  const _3244_3442 = rhs[9] * rhs[15] - rhs[11] * rhs[13];
  const _3344_3443 = rhs[10] * rhs[15] - rhs[11] * rhs[14];

  const det = determinant(rhs);
  if (det !== 0) {
    const invDet = 1 / det;

    return [
      invDet *
        (rhs[5] * _3344_3443 - rhs[6] * _3244_3442 + rhs[7] * _3243_3342),
      -invDet *
        (rhs[1] * _3344_3443 - rhs[2] * _3244_3442 + rhs[3] * _3243_3342),
      invDet *
        (rhs[1] * _2344_2443 - rhs[2] * _2244_2442 + rhs[3] * _2243_2342),
      -invDet *
        (rhs[1] * _2334_2433 - rhs[2] * _2234_2432 + rhs[3] * _2233_2332),

      -invDet *
        (rhs[4] * _3344_3443 - rhs[6] * _3144_3441 + rhs[7] * _3143_3341),
      invDet *
        (rhs[0] * _3344_3443 - rhs[2] * _3144_3441 + rhs[3] * _3143_3341),
      -invDet *
        (rhs[0] * _2344_2443 - rhs[2] * _2144_2441 + rhs[3] * _2143_2341),
      invDet *
        (rhs[0] * _2334_2433 - rhs[2] * _2134_2431 + rhs[3] * _2133_2331),

      invDet *
        (rhs[4] * _3244_3442 - rhs[5] * _3144_3441 + rhs[7] * _3142_3241),
      -invDet *
        (rhs[0] * _3244_3442 - rhs[1] * _3144_3441 + rhs[3] * _3142_3241),
      invDet *
        (rhs[0] * _2244_2442 - rhs[1] * _2144_2441 + rhs[3] * _2142_2241),
      -invDet *
        (rhs[0] * _2234_2432 - rhs[1] * _2134_2431 + rhs[3] * _2132_2231),

      -invDet *
        (rhs[4] * _3243_3342 - rhs[5] * _3143_3341 + rhs[6] * _3142_3241),
      invDet *
        (rhs[0] * _3243_3342 - rhs[1] * _3143_3341 + rhs[2] * _3142_3241),
      -invDet *
        (rhs[0] * _2243_2342 - rhs[1] * _2143_2341 + rhs[2] * _2142_2241),
      invDet *
        (rhs[0] * _2233_2332 - rhs[1] * _2133_2331 + rhs[2] * _2132_2231),
    ];
  } else {
    return rhs;
  }
}

export function GetPtEnu(w2b) {
  let tw2b = makeTFrom6Dof(w2b[0], w2b[1], w2b[2], w2b[3], w2b[4], w2b[5]);
  let inverseMatrix = inverse(tw2b);

  let result = {};

  result.e = inverseMatrix[12];
  result.n = inverseMatrix[13];
  //let u = inverse[14];

  return result;
}
