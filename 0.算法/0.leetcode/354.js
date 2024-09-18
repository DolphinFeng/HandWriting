// 俄罗斯套娃问题

function maxEvenlops (envelopes) {
  envelopes.sort((a, b) => (a[0] === b[0] ? b[1] - a[1] : a[0] - b[0]));
  let n = envelopes.length;
  let f = [envelopes[0][1]];
  const binarySearch = (x) => {
    let left = 0,
      right = f.length;
    while (left < right) {
      let mid = left + ((right - left) >> 1);
      if (f[mid] < x) left = mid + 1;
      else right = mid;
    }
    return left;
  };
  for (let i = 1; i < n; i++) {
    if (f[f.length - 1] < envelopes[i][1]) {
      f.push(envelopes[i][1]);
    } else {
      let cur = envelopes[i][1];
      let index = binarySearch(cur);
      f[index] = cur;
    }
  }
  return f.length;
}

let envelopes = [[5,4],[6,4],[6,7],[2,3]]

console.log(maxEvenlops(envelopes));
