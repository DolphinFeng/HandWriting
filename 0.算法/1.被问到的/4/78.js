// 在实际的Java编程中,常常需要克隆一个对象。请编写一个工具类ObjectCloner,实现clone方法来克隆指
// 定对象。你的实现需要满足以下要求:
// 1.obj1和 obj2是不同的对象实例(obj1!=obj2)。
// 2.obj1和obj2是同一类型,具备相同的字段和方法。
// 3.obj2的字段值应与obj1保持一致,包括对基本数据类型、对象类型(包括嵌套对象)和数组类型的字段进
// 行深度克隆。
// 4.ObjectCloner应是一个通用的工具类,能够对任意类型的对象跟进行克隆。


class ObjectCloner {
    static clone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (obj instanceof Date) {
            let copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        if (obj instanceof Array) {
            let copy = [];
            for (let i = 0, len = obj.length; i < len; i++) {
                copy[i] = ObjectCloner.clone(obj[i]);
            }
            return copy;
        }

        if (obj instanceof Object) {
            let copy = {};
            for (let attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    copy[attr] = ObjectCloner.clone(obj[attr]);
                }
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    }
}
