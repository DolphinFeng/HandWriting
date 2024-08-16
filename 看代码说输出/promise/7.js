// 虾皮面经

new Promise((resolve, reject) => {

    console.log(1)
 
    resolve(true);
 
    console.log(2);
 
    throw new Error('err');
 
    reject(false);
 
    console.log(3)
 
   }).catch(ex => console.log(ex))
   .then(res => console.log(res))
 