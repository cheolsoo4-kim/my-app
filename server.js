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
            <title>Render Super Proxy v3</title>
            <style>
                body { font-family: sans-serif; text-align: center; padding-top: 100px; background: #f8fafc; color: #1e293b; }
                .box { background: white; padding: 40px; display: inline-block; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
                input[type="text"] { width: 450px; padding: 14px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 16px; outline: none; }
                input[type="text"]:focus { border-color: #6366f1; }
                input[type="submit"] { padding: 14px 28px; background: #6366f1; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold; margin-left: 10px; }
                input[type="submit"]:hover { background: #4f46e5; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>Node.js 보안 v3</h2>
                <form method="GET" action="/bypass">
                    <input type="text" name="url" placeholder="https://www.google.com" required>
                    <input type="submit" value="안전 우회 접속">
                </form>
            </div>
        </body>
        </html>
    `);
});

// 2. [핵심 엔진] 정밀 링크 리라이터 라우터
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
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
                'Referer': hostUrl // 원격지 서버가 프록시 요청을 거부하지 못하도록 레퍼러 위장
            }
        };

        const proxyReq = clientModule.request(targetUrl, options, (proxyRes) => {
            // 원본 서버의 헤더 중 프록시 운영에 방해되는 보안 헤더 해제 후 전송
            const responseHeaders = Object.assign({}, proxyRes.headers);
            delete responseHeaders['content-security-policy'];
            delete responseHeaders['x-frame-options'];

            // 오리지널 상태 코드로 응답 헤더 작성
            res.writeHead(proxyRes.statusCode, responseHeaders);

            const contentType = proxyRes.headers['content-type'] || '';
            if (contentType.includes('text/html')) {
                let chunks = [];
                proxyRes.on('data', (chunk) => { chunks.push(chunk); });
                proxyRes.on('end', () => {
                    let body = Buffer.concat(chunks).toString('utf-8');

                    // 헬퍼 함수: 상대 경로를 절대 경로로 변환
                    function toAbs(relativeUrl) {
                        if (/^(https?:|data:|javascript:)/i.test(relativeUrl)) return relativeUrl;
                        if (relativeUrl.startsWith('//')) return 'https:' + relativeUrl;
                        if (relativeUrl.startsWith('/')) return hostUrl + relativeUrl;
                        return currentDirUrl + relativeUrl.replace(/^\.\//, '');
                    }

                    // [정밀 매칭 알고리즘] 자바스크립트는 건드리지 않고 오직 HTML 태그의 속성값만 치환
                    body = body.replace(/(href|src)\s*=\s*["']([^"']+)["']/gi, (match, attr, url) => {
                        const lowAttr = attr.toLowerCase();
                        const lowUrl = url.toLowerCase();

                        // 정적 자원(CSS, JS)은 프록시를 태우면 MIME 타입 에러가 나므로 원본 절대경로로 다이렉트 로드
                        if (lowUrl.includes('.css') || lowUrl.includes('.js') || lowUrl.includes('.png') || lowUrl.includes('.jpg') || lowUrl.includes('.webp') || lowUrl.includes('.gif')) {
                            return `${attr}="${toAbs(url)}"`;
                        }

                        // 일반 페이지 이동 링크만 내 렌더 프록시 주소와 안전하게 결합
                        if (lowAttr === 'href') {
                            return `${attr}="${myProxyBase}${encodeURIComponent(toAbs(url))}"`;
                        }

                        return `${attr}="${toAbs(url)}"`;
                    });

                    res.end(body);
                });
            } else {
                // 이미지, CSS 등은 스트림 그대로 통과
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
    console.log(`Proxy Node.js Server v3 is running on port ${PORT}`);
});
