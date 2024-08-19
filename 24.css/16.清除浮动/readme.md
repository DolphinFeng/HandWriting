# 浮动的消极作用
    父元素的高度出现坍塌

1. 给父元素设置高度拉回来  写法太low
    - 也可以添加一个子元素，设置一个高度

2. 最后一个浮动元素之后添加一个div，给这个div添加一个clear: both; 属性   写法也比较low
    理解：浮动就相当于一个水流，流出去的时候添加一个clear: both属性 堵住浮动

3. 给ul添加一个伪元素after，添加属性content: ''; clear: both; display: block;

4. 给受害者加上clear: both  缺点 ul的高度依旧是0  并且不符合人类思维 

5. 给ul加上BFC属性  高度回来了  
    以下属性可以出发BFC
    - float: left | right;
    - position: absolute | fixed; 
    - display: flex | inline-block | inline-flex | table-xx;
    - overflow: hidden | overlay | auto | scroll;
