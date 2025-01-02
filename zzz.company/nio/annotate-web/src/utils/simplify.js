import {Cartesian3} from 'cesium';

function subtract(first, rhs) {
  return new Cartesian3(first.x - rhs.x, first.y - rhs.y, first.z - rhs.z);
}

function cross(first, rhs) {
  return first.x * rhs.y - rhs.x * first.y;
}

function norm(first) {
  return Math.sqrt(first.x * first.x + first.y * first.y);
}

function findMaximumDistance(Points) {
  const firstpoint = Points[0];
  const lastpoint = Points[Points.length - 1];
  let index = 0;
  let Mdist = -1;

  const p = subtract(lastpoint, firstpoint);

  for (let i = 1; i < Points.length - 1; i++) {
    const pp = subtract(Points[i], firstpoint);
    const Dist = Math.abs(cross(pp, p)) / norm(p);

    if (Dist > Mdist) {
      Mdist = Dist;
      index = i;
    }
  }

  return [index, Mdist];
}

export function simplifyWithRDP(Points, epsilon) {
  if (Points.length < 3) {
    return Points;
  }

  const maxDistance = findMaximumDistance(Points);

  if (maxDistance[1] >= epsilon) {
    const index = maxDistance[0];
    const path1 = Points.slice(0, index + 1);
    const path2 = Points.slice(index);

    const r1 = simplifyWithRDP(path1, epsilon);
    const r2 = simplifyWithRDP(path2, epsilon);

    const rs = r1.slice(0, r1.length - 1).concat(r2);
    return rs;
  } else {
    return [Points[0], Points[Points.length - 1]];
  }
}

// Example usage:
//const simplify = new SimplifyPath();
//const points = [new Point(0, 0, 0), new Point(1, 1, 0), new Point(2, 2, 0), new Point(3, 3, 0), new Point(4, 4, 0)];
//
//const epsilon = 0.5;
//const simplifiedPoints = simplify.simplifyWithRDP(points, epsilon);
//console.log(simplifiedPoints);
