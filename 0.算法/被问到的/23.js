var reverse = function(x) {
    // write your code here.
    let arr = x.toString().split('')
    // console.log(arr);
    if (x >= 0 ) {
        let res = Number(arr.reverse().join(''))
        return check(res) 
    } else {
        x = -x
        arr = x.toString().split('').reverse().join('')
        res = 0 + '-' + arr 
        return check(res)
    }

    function check (x) {
        if (x < -(2 ** 31) || x > (2 ** 31) - 1) {
            return 0
        } else {
            return x
        }
    }
 };

 console.log(reverse(120));