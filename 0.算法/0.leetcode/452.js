// 弓箭射气球

var findMinArrowShots = function(points) {
    points.sort((a, b) => a[1] - b[1]);
    
    let count = 0;
    let i = 0;
    while (i < points.length) {
        const right = points[i][1];
        i++;
        while (i < points.length && points[i][0] <= right) {
            i++
        }
        count++;
    }
    return count;
};

let points = [[10,16],[2,8],[1,6],[7,12]]; // [[1,6], [2,8], [7,12], [10,16]]
console.log(findMinArrowShots(points)); // 2