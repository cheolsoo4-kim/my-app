// server.js
const express = require('express');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 메인 검색 UI 화면
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Render Super Proxy v2</title>
            <style>
                body { font-family: sans-serif; text-align: center; padding-top: 100px; background: #f8fafc; color: #1e293b; }
                .box { background: white; padding: 40px; display: inline-block; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
                input[type="text"] { width: 450px; padding: 14px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 16px; outline: none; transition: border 0.2s; }
                input[type="text"]:focus { border-color: #6366f1; }
                input[type="submit"] { padding: 14px 28px; background: #6366f1; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold; margin-left: 10px; }
                input[type="submit"]:hover { background: #4f46e5; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>Node.js 무력화 방지 보안 프록시</h2>
                <form method="GET" action="/bypass">
                    <input type="text" name="url" placeholder="https://www.google.com" required>
                    <input type="submit" value="안전 우회 접속">
                </form>
            </div>
        </body>
        </html>
    `);
});

// 2. [핵심 엔진] 스트림 분석 및 HTML 링크 리라이터 라우터
app.get('/bypass', (req, res) => {
    let targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('URL 매개변수가 필요합니다.');

    if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'http://' + targetUrl;
    }

    try {
        const parsedUrl = new URL(targetUrl);
        const hostUrl = parsedUrl.protocol + '//' + parsedUrl.host;
        
        // 상대경로 하위 폴더 추적용 베이스 디렉토리 계산
        let pathDepth = parsedUrl.pathname;
        if (!pathDepth.endsWith('/')) {
            pathDepth = pathDepth.substring(0, pathDepth.lastIndexOf('/') + 1);
        }
        const currentDirUrl = hostUrl + pathDepth;

        const clientModule = parsedUrl.protocol === 'https:' ? https : http;
        const myProxyBase = parsedUrl.protocol + '//' + req.get('host') + '/bypass?url=';

        const options = {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8'
            }
        };

        const proxyReq = clientModule.request(targetUrl, options, (proxyRes) => {
            // 원본 서버의 콘텐츠 타입 그대로 포워딩 (CSS, JS, Image 호환성 유지)
            res.writeHead(proxyRes.statusCode, proxyRes.headers);

            // HTML 문서 파일일 때만 링크들을 내 프록시 주소로 치환 변환
            const contentType = proxyRes.headers['content-type'] || '';
            if (contentType.includes('text/html')) {
                let body = '';
                proxyRes.on('data', (chunk) => { body += chunk; });
                proxyRes.on('end', () => {
                    // 2-1. 절대경로 (http://...) 링크 치환
                    body = body.replace(/(href|src)=["'](https?:\/\/[^"']+)["']/gi, (match, attr, url) => {
                        // 외부 CSS나 스크립트는 원본 절대경로 유지하여 깨짐 방지
                        if (url.includes('.css') || url.includes('.js')) return `${attr}="${url}"`;
                        return `${attr}="${myProxyBase}${encodeURIComponent(url)}"`;
                    });

                    // 2-2. 루트 기준 상대경로 (/[경로]) 링크 치환
                    body = body.replace(/(href|src)=["'](\/[^"'].*?)["']/gi, (match, attr, path) => {
                        if (path.startsWith('//')) return `${attr}="https:${path}"`; // //도메인 형태 대응
                        const absUrl = hostUrl + path;
                        if (path.includes('.css') || path.includes('.js')) return `${attr}="${absUrl}"`;
                        return `${attr}="${myProxyBase}${encodeURIComponent(absUrl)}"`;
                    });

                    // 2-3. 현재 디렉토리 기준 상대경로 (./ 또는 파일명 시작) 링크 치환
                    body = body.replace(/(href|src)=["']((?!(https??:|\/|#|javascript:))[^"']+)["']/gi, (match, attr, path) => {
                        const absUrl = currentDirUrl + path.replace(/^\.\//, '');
                        if (path.includes('.css') || path.includes('.js')) return `${attr}="${absUrl}"`;
                        return `${attr}="${myProxyBase}${encodeURIComponent(absUrl)}"`;
                    });

                    res.end(body);
                });
            } else {
                // 이미지, CSS, JS 파일등은 변환 없이 스트림 그대로 브라우저에 파이핑 통과
                proxyRes.pipe(res);
            }
        });

        proxyReq.on('error', (err) => {
            res.status(500).send('원격 서버 연결 실패: ' + err.message);
        });

        proxyReq.end();

    } catch (e) {
        res.status(400).send('잘못된 URL 형식입니다.');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy Node.js Server is running on port ${PORT}`);
});
