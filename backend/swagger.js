import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vega Auto Viz API',
      version: '1.0.0',
      description: 'API documentation for Vega Auto Viz backend',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Swagger will scan route files
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
