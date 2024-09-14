this.a = 'byte'

function A () {
    this.a = '123'
}

A.prototype.log = function () {
    console.log(this.a + 1);
}

global.a = 'dance'

var a = new A()

var log = a.log

a.log()

log()
