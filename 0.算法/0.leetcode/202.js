// 快乐数

/**
 * @param {number} n
 * @return {boolean}
 */
var isHappy = function(n) {
    const trueBackNum = [1, 7]

    let tempNum = n
    while (tempNum >= 10) {
        let nStr = `${tempNum}`
        let loopTempNum = 0

        for (let i = 0, len = nStr.length; i < len; i++) {
            loopTempNum += Math.pow(+nStr[i], 2)
        }

        tempNum = loopTempNum
    }

    return trueBackNum.includes(tempNum)
};