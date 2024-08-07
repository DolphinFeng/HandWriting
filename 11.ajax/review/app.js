const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// 中间件设置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 处理跨域请求
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// 定义代理路由
app.get('/api/proxy', async (req, res) => {
    try {
        const response = await axios.get('https://api.juejin.cn/interact_api/v1/message/count?aid=2608&uuid=7365761803367155238&spider=0');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});