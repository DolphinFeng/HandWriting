// 两数之和

let num = [2, 7, 9, 15]

function getIndex (num, target) {
    let obj = {}
    for (let i = 0; i < num.length; i++) {
        if (obj[target - num[i]] !== undefined) {
            return [obj[target - num[i]], i]
        } else {
            obj[num[i]] = i
        }
    }
}
console.log(getIndex(num, 9));
