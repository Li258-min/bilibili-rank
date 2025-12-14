// api/popular.js
import axios from 'axios';

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const response = await axios.get(
      'https://api.bilibili.com/x/web-interface/popular?ps=20&pn=1',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Referer': 'https://www.bilibili.com/',
          'Connection': 'keep-alive'
        }
      }
    );

    // 检查是否返回 HTML（说明被拦截）
    if (response.data.includes('<html>') || response.data.includes('A server error')) {
      throw new Error('B站接口返回了错误页面，请检查 User-Agent 或接口是否变更');
    }

    const data = response.data;
    if (data.code !== 0) {
      throw new Error(data.message || 'B站接口返回错误');
    }

    const videos = data.data.list.map(item => ({
      title: item.title,
      author: item.owner.name,
      bvid: item.bvid,
      play: item.stat.view,
      like: item.stat.like,
      reply: item.stat.reply,
      link: `https://www.bilibili.com/video/${item.bvid}`
    }));

    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching B站 data:', error.message);
    res.status(500).json({ 
      error: '获取数据失败，请稍后再试', 
      detail: error.message 
    });
  }
}
