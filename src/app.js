require('dotenv').config();

const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

(async () => {
  try {
    const server = await createServer(container);
    
    await server.start();
    
    console.log('🚀 Server running on:', server.info.uri);
    console.log('📦 Environment:', process.env.NODE_ENV);
    console.log('🔗 Database connected');
    
    // Handle shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.stop({ timeout: 10000 }).then(() => {
        console.log('Server stopped');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();