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
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    const data = response.data;
    if (data.code !== 0) {
      throw new Error(data.message || 'B站接口返回错误');
    }

    // 提取需要的字段
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
    res.status(500).json({ error: '获取数据失败，请稍后再试' });
  }
}
