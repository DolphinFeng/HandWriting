// 美团一面 手写 node 数组转 dom 字符串

type DocNode = {
	type: 'link' | 'text' | 'image' | 'break' | 'division',
	children: DocNode[] | string,
	properties: any
}

const map = {
  link: 'a',
  text: 'span',
  image: 'img',
  break: 'br',
  division: 'div'
}

/**
 * 将 DocNode 数组转换为 HTML 字符串
 * @param nodes - DocNode 数组，表示文档节点
 * @returns 转换后的 HTML 字符串
 */
function renderToHTML(nodes: DocNode[]): string {
  let res = '' // 初始化结果字符串

  for(const node of nodes){
    if(node.type === 'break'){ // 处理换行节点
      res += '<br />'
      continue
    }
    let str = ''
    str += '<'
    str += map[node.type] // 获取对应的 HTML 标签

    // 处理节点的属性
    if(node.properties){
      let tempStr = Object.entries(node.properties)
        .map(([key, val]) => ` ${key}="${val}"`)
        .join('')
      str += tempStr
    }
    str += '>'
    
    // 处理节点的子节点或文本内容
    if(typeof node.children === 'string') {
      str += node.children
    } else {
      str += renderToHTML(node.children)
    }
    
    str += `</${map[node.type]}>` // 闭合标签
    res += str
  }

  return res // 返回最终的 HTML 字符串
}


const nodes: DocNode[] = [
  {
    type: 'text',
    children: 'Hello, ',
    properties: {}
  },
  {
    type: 'link',
    children: 'click here',
    properties: { href: 'https://example.com' }
  },
  {
    type: 'division',
    children: [
      {
        type: 'image',
        children: '',
        properties: { src: 'image.png', alt: 'An image' }
      },
      {
        type: 'break',
        children: '',
        properties: {}
      },
      {
        type: 'text',
        children: 'More text',
        properties: {}
      }
    ],
    properties: {}
  }
];

const htmlString = renderToHTML(nodes);
console.log(htmlString);


// <span>Hello, <span /><a href="https://example.com">click here<a /><div><img src="image.png" alt="An image"><img /><br /><span>More text<span /><div />