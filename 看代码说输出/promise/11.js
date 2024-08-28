// 简单：状态不会改了

new Promise((resolve, reject) => {

    console.log(1)
 
    resolve(true);
 
    console.log(2);
 
    throw new Error('err');
 
    reject(false);
 
    console.log(3)
 
   }).catch(err => console.log(err))
   .then(res => console.log(res))