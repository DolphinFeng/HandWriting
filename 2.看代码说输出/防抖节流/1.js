function log () {
    console.log('a');
}

const debounceFn = debounce(log, 350)

function debounce (fn, delay) {
    let timer
    return function () {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, arguments)
        }, delay)
    }
}

for (let i = 1; i <= 10; i++) {
    setTimeout(debounceFn, i * 100)
}

// 100 ms 内调用一次防抖，最终只会打印一次，因为防抖的间隔是 350，最后一次生效