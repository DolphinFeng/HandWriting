console.log(1);
const p = new Promise(r=>setTimeout(r,1000))
setTimeout(()=>{
	console.log(2);
})
await p
console.log(3);