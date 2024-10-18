const first = () => {
    return new Promise((resolve, reject) => {
        console.log(1);
        const p = new Promise((resolve, reject) => {
            console.log(2);
            setTimeout(() => {
                console.log(3);
                resolve(4)
            }, 0)
            resolve(5)
        })
        resolve(6)
        p.then(arg => {
            console.log(arg);
        })
    })
}
first().then(arg => {
    console.log(arg);
})


console.log(7);

// p先 再是f  有点坑