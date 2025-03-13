const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(express.json()); // JSON 요청을 처리하기 위한 미들웨어

// ✅ MySQL 데이터베이스 연결 (연결 풀 사용)
const db = mysql.createPool({
    host: process.env.DB_HOST, // 환경 변수에서 불러오기
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// ✅ MySQL 연결 확인 후 서버 실행
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ MySQL 연결 실패:', err);
        process.exit(1); // 연결 실패 시 서버 종료
    }
    console.log('✅ MySQL 연결 성공!');
    connection.release(); // 연결 반환

    // ✅ 서버 실행 (MySQL 연결 성공 후 실행)
    app.listen(port, () => {
        console.log(`🚀 Server is running at http://localhost:${port}`);
    });
});



// ✅ 기본 라우트 (서버 동작 확인용)
app.get('/', (req, res) => {
    res.send('Hello from Express API!');
});

// ✅ 댓글 저장 API (POST /comments)
app.post('/comments', (req, res) => {
    const { nickname, comment } = req.body;

    if (!nickname || !comment) {
        return res.status(400).json({ error: '닉네임과 댓글을 입력하세요.' });
    }

    const sql = 'INSERT INTO comments (nickname, comment) VALUES (?, ?)';
    db.query(sql, [nickname, comment], (err, result) => {
        if (err) {
            console.error('❌ 댓글 저장 실패:', err);
            return res.status(500).json({ error: '서버 오류로 인해 댓글 저장에 실패했습니다.' });
        }
        res.status(201).json({ message: '✅ 댓글이 성공적으로 저장되었습니다!', id: result.insertId });
    });
});

// ✅ 댓글 목록 조회 API (GET /comments)
app.get('/comments', (req, res) => {
    const sql = 'SELECT * FROM comments ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ 댓글 조회 실패:', err);
            return res.status(500).json({ error: '서버 오류로 인해 댓글을 불러올 수 없습니다.' });
        }
        res.json(results);
    });
});
