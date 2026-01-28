// server.js
// Main server file - Entry point for the application

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Database
import { sequelize } from './src/models/index.js';

// Routes
// import userRoutes from './src/routes/userRoutes.js';
// import productRoutes from './src/routes/productRoutes.js';
// import saleRoutes from './src/routes/saleRoutes.js';
import chartRoutes from './src/routes/aiChartRoutes.js';

// Seeder
// import { seedDatabase } from './src/utils/seeder.js';

// Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

// Load environment variables
dotenv.config();

// App init
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Vega Chart API is running',
    version: '1.0.0'
  });
});

// API Routes
// app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/sales', saleRoutes);
app.use('/api/chart-data', chartRoutes);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Init app
const initializeApp = async () => {
  try {
    console.log('📊 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('🔄 Syncing database...');
    await sequelize.sync({ alter: true }); // safer than force:true
    console.log('✅ Database synced');

    // console.log('🌱 Seeding database...');
    // await seedDatabase();
    // console.log('✅ Database seeded');

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📘 Swagger UI: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ App failed to start:', error);
    process.exit(1);
  }
};

initializeApp();
