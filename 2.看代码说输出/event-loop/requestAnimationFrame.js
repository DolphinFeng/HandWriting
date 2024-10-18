setTimeout(() => console.log('timeout')); 
requestAnimationFrame(() => { console.log('animation') }); 
Promise.resolve().then(console.log('微任务'))

// Promise {<fulfilled>: undefined}   timeout   animation