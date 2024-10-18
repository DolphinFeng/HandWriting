process.nextTick(function(){
    console.log('1');
});
process.nextTick(function(){
    console.log('2');
     setImmediate(function(){
        console.log('3');
    });
    process.nextTick(function(){
        console.log('4');
    });
});

setImmediate(function(){
    console.log('5');
     process.nextTick(function(){
        console.log('6');
    });
    setImmediate(function(){
        console.log('7');
    });
});

setTimeout(e=>{
    console.log(8);
    new Promise((resolve,reject)=>{
        console.log(8+'promise');
        resolve();
    }).then(e=>{
        console.log(8+'promise+then');
    })
},0)

setTimeout(e=>{ console.log(9); },0)

setImmediate(function(){
    console.log('10');
    process.nextTick(function(){
        console.log('11');
    });
    process.nextTick(function(){
        console.log('12');
    });
    setImmediate(function(){
        console.log('13');
    });
});

console.log('14');
 new Promise((resolve,reject)=>{
    console.log(15);
    resolve();
}).then(e=>{
    console.log(16);
})