let foo = 1;
setTimeout(() => {
    foo = 2;
}, 500);
module.exports = {
    foo: foo,
};