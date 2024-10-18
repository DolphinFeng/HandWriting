var openLock = function (deadends, target) {
    let step = 0;
    const deadSet = new Set();
    const visitedSet = new Set();

    for (const dead of deadends) {
        deadSet.add(dead);
    }

    const q = ["0000"];

    while (q.length) {
        const size = q.length;
        for (let i = 0; i < size; i++) {
            const node = q.shift();
            if (node == target) {
                return step;
            }
            if (visitedSet.has(node)) {
                continue;
            }
            if (deadSet.has(node)) {
                continue;
            }
            visitedSet.add(node);

            for (let j = 0; j < node.length; j++) {
                const num = node[j] - '0';
                const up = (num + 1) % 10;
                const down = (num + 9) % 10;
                q.push(node.substring(0, j) + up + node.substring(j + 1));
                q.push(node.substring(0, j) + down + node.substring(j + 1));
            }
        }
        step++;
    }
    return -1;
};

let deadends = ["0201", "0101", "0102", "1212", "2002"];
let target = "0202";
console.log(openLock(deadends, target)); // 6