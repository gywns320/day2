// Vercel 서버리스 함수: API 키는 환경변수(PIXABAY_API_KEY)에서만 읽는다.
module.exports = async (req, res) => {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return res.status(500).json({ error: 'PIXABAY_API_KEY 환경변수가 설정되지 않았습니다.' });

  const q = String(req.query.q || '').trim().slice(0, 100);
  if (!q) return res.status(400).json({ error: '검색어를 입력하세요.' });

  const url = 'https://pixabay.com/api/?key=' + encodeURIComponent(key)
    + '&q=' + encodeURIComponent(q)
    + '&image_type=photo&per_page=10&safesearch=true&lang=ko';
  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: 'Pixabay 오류 ' + r.status });
    const data = await r.json();
    const hits = data.hits.map(h => ({
      id: h.id, tags: h.tags, user: h.user,
      previewURL: h.previewURL, webformatURL: h.webformatURL
    }));
    res.setHeader('Cache-Control', 's-maxage=3600');
    res.status(200).json({ hits });
  } catch (e) {
    res.status(502).json({ error: '이미지 서버에 연결하지 못했습니다.' });
  }
};
