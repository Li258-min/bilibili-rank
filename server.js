// server.js
const express = require('express');
const axios = require('axios');
const app = express();

// 允许跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// 获取全站热门（50条）
async function fetchPopular() {
  try {
    const res = await axios.get('https://api.bilibili.com/x/web-interface/popular?ps=50', {
      headers: { 'Referer': 'https://www.bilibili.com/', 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    return res.data.code === 0 ? res.data.data.list || [] : [];
  } catch (e) {
    console.warn('⚠️ 全站热门失败:', e.message);
    return [];
  }
}

// 获取每周必看
async function fetchWeekly() {
  try {
    const res = await axios.get('https://api.bilibili.com/x/web-interface/popular/series/one?number=1', {
      headers: { 'Referer': 'https://www.bilibili.com/', 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    return res.data.code === 0 ? res.data.data.list || [] : [];
  } catch (e) {
    console.warn('⚠️ 每周必看失败:', e.message);
    return [];
  }
}

// 获取全站三日排行榜
async function fetchRankingAll() {
  try {
    const res = await axios.get('https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all', {
      headers: { 'Referer': 'https://www.bilibili.com/', 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    return res.data.code === 0 ? res.data.data.list || [] : [];
  } catch (e) {
    console.warn('⚠️ 三日排行榜失败:', e.message);
    return [];
  }
}

// 聚合所有榜单
app.get('/api/bilibili/popular/all', async (req, res) => {
  try {
    console.log('🔍 请求多榜单数据...');
    const [popular, weekly, ranking] = await Promise.all([
      fetchPopular(),
      fetchWeekly(),
      fetchRankingAll()
    ]);

    const allVideos = [...popular, ...weekly, ...ranking];
    const seen = new Set();
    const uniqueVideos = allVideos.filter(v => {
      if (!v.bvid || seen.has(v.bvid)) return false;
      seen.add(v.bvid);
      return true;
    });

    console.log(`✅ 返回 ${uniqueVideos.length} 条视频`);
    res.json({ code: 0, data: { list: uniqueVideos } });
  } catch (err) {
    console.error('❌ 聚合失败:', err);
    res.status(500).json({ code: -1, message: '服务器错误' });
  }
});

// 静态文件服务
app.use(express.static('.'));

// 启动
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 B站聚合榜服务启动成功！');
  console.log(`👉 访问地址: http://localhost:${PORT}`);
});