(function test(){
    console.log(1)
    
    setTimeout(function() {
        console.log(2)
    }, 1000);
    
    setTimeout(function() {
        console.log(3)
    },0);
    
    setTimeout(function() {
        console.log(4)
    }, 0);
})()

// 宏 
// 微
// 输出 1 3 4 2
// 有点坑