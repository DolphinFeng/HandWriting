const multiple = {
    result: function (...args) {
        let product = args.reduce((acc, val) => acc * val, 1)

        function result (...rest) {
            if (rest.length === 0) {
                return product
            }
            product *= rest.reduce((acc, val) => acc * val, 1)
            return result
        }

        return result
    }
}

// 示例使用
console.log(multiple.result(2)(3)(4)()); // 输出 24
console.log(multiple.result(1, 2, 3)(4, 5)()); // 输出 120