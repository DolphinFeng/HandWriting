let arr1 = [1, 3, 5]

let arr2 = [2, 4, 6, 7, 8, 9]

function merge (v1, v2) {
    let i = 0, j = 0, res = []
    while (i < v1.length && j < v2.length) {
        if (v1[i] < v2[j]) {
            res.push(v1[i])
            i++
        } else {
            res.push(v2[j])
            j++
        }
    }

    while (i < v1.length) {
        res.push(v1[i])
        i++
    }
    while (j < v2.length) {
        res.push(v2[j])
        j++
    }
    return res
}

console.log(merge(arr1, arr2));
