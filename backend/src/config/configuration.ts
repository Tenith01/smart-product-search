export default () => ({
  port: parseInt(process.env.PORT || '3001', 10) || 3001,
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tiron',
  },
});
