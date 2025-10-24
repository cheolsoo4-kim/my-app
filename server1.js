const app = require('./app');
const { syncDatabase } = require('./models');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0'; // 모든 네트워크 인터페이스에서 접근 허용

// 데이터베이스 동기화 후 서버 시작
const startServer = async () => {
  try {
    await syncDatabase();
    
    // 0.0.0.0으로 바인딩하여 외부 접속 허용
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on ${HOST}:${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🌍 External Access: http://YOUR_SERVER_IP:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // 우아한 종료
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('💤 Process terminated');
      });
    });

    process.on('SIGINT', () => {
      console.log('👋 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('💤 Process terminated');
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
