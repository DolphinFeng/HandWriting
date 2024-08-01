function fn () {
    return new Promise((resolve, reject) => {
        reject('err')
    }) 
}

fn()
.then(
    () => {

    },
    (err) => {
        console.log(err);
    }
)
.catch(err => {
    console.log(111);
    console.log(err);
})
.then(res => {
    console.log(res);
})

// promise实例对象reject让then执行第二个回调，这个then返回resolve给后面，后面的then照样执行，但是catch不执行