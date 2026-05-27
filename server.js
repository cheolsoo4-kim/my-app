const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. 기본 UI 메인 화면 (주소창에 접속했을 때 나타남)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Render Private Proxy</title>
            <style>
                body { font-family: sans-serif; text-align: center; padding-top: 100px; background: #f0f2f5; }
                .box { background: white; padding: 40px; display: inline-block; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                input[type="text"] { width: 400px; padding: 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; }
                input[type="submit"] { padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold; }
                input[type="submit"]:hover { background: #4338ca; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>Render 전용 무차단 스마트 프록시</h2>
                <form method="GET" action="/bypass">
                    <input type="text" name="url" placeholder="https://www.google.com" required>
                    <input type="submit" value="우회 접속 시작">
                </form>
            </div>
        </body>
        </html>
    `);
});

// 2. [핵심] 웹서핑 우회 라우터 엔진
app.use('/bypass', (req, res, next) => {
    let targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('URL이 누락되었습니다.');

    // 프로토콜 자동 보정
    if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'http://' + targetUrl;
    }

    // 미들웨어를 동적으로 생성하여 타겟 사이트 대리 수신 실행
    createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        followRedirects: true, // 리다이렉트 자동 추적 활성화
        pathRewrite: (path, req) => {
            // 내부 쿼리스트링 파싱 후 순수 타겟 경로만 남김
            return ''; 
        },
        onProxyReq: (proxyReq, req, res) => {
            // 회사 방화벽이나 웹서버 감지를 피하기 위해 일반 브라우저 헤더로 마스킹
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        },
        onError: (err, req, res) => {
            res.status(500).send('프록시 통신 중 오류가 발생했습니다: ' + err.message);
        }
    })(req, res, next);
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
