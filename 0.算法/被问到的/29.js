// 遍历DOM树打印每个元素的tagName

// <!DOCTYPE html>
// <html>
// <head>
//   <title>Document</title>
// </head>
// <body>
//   <div>
//     <p>Paragraph 1</p>
//     <p>Paragraph 2</p>
//   </div>
//   <span>Some text</span>
// </body>
// </html>

// BODY
// DIV
// P
// P
// SPAN

function traverseDOM(node) {
  console.log(node.tagName); // 打印当前节点的tagName
  node = node.firstElementChild; // 获取第一个子元素
  while (node) {
    traverseDOM(node); // 递归遍历子元素
    node = node.nextElementSibling; // 获取下一个兄弟元素
  }
}

// 从document.body开始遍历
traverseDOM(document.body);
