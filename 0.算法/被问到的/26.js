// 根据前中序得到二叉树

function createTree(middle,final){
    if(middle.length ==0){
        return 
    }
    let root = final[final.length-1];
    let left1 = []
    let left2 = []
    let index = -1
    let jud = false
    let right1 = []
    let right2 = []
    for(let i = 0; i < middle.length; i++){
        if(middle[i]===root.val){
            break
        }
        left1.push(middle[i])
        left2.push(final[i])
        index = i
    }
    root.left = createTree(left1,left2)
    for(let i = 0; i < middle.length; i++){
        if(jud){
            right1.push(middle[i])
        }
        if(middle[i]===root.val){
            jud = true
        }
    }
    right2 = final.slice(index+1,right1.length+index+1)
    root.right = createTree(right1,right2)
    return root
}