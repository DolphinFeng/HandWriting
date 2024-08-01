// 判断版本号
// v1.0.1-base.1 v1.0.2-cr.5 v1.2.3-alpha.1
// cr>base>alpha
function compare(v1,v2){
    let arr1 = v1.split('-')[0].slice(1) // 1.0.1
    let arr2 = v2.split('-')[0].slice(1)
    let arr3 = arr1.split('.') // 1 0 1
    let arr4 = arr2.split('.') // 1 0 2
    let max = Math.max(arr3.length, arr4.length)
    for (let i = 0; i < max; i++) {
        if (arr3[i] && arr4[i]) {
            if (arr3 !== arr4) {
                return arr3[i] > arr4[i] ? v1 : v2
            } 
        } else {
            return arr3[i] ? v1 : v2
        }
    }
    let obj = {
        cr: 3,
        base: 2, 
        alpha: 1
    }
    let arr5 = v1.split('-')[1].split('.') // base 1
    let arr6 = v2.split('-')[1].split('.')
    if (arr5[0] !== arr6[0]) {
        return obj[arr5[0]] > obj[arr6[0]] ? v1 : v2
    }
    if (arr5[1] !== arr6[1]) {
        
    }
}
