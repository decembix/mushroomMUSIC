const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000; // 사용할 포트 번호

// 정적 파일 제공
app.use(express.static(path.join(__dirname)));

// 기본 라우트 (index.html 제공)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
