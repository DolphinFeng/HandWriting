// 两数只和

function twoSum (arr, target) {
    let obj = {};
    for (let i = 0; i < arr.length; i++) {
        if (obj[target - arr[i]] !== undefined) {
            return [obj[target - arr[i]], i];
        } else {
            obj[arr[i]] = i;
        }
    }
}