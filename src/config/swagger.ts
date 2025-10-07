import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Give Life API',
    version: '1.0.0',
    description: `
# Welcome to Give Life Website API 🩸

Give Life is a comprehensive blood donation platform that connects donors with those in need.

## Getting Started
Use the endpoints below to interact with the Give Life API. All endpoints require proper authentication unless otherwise specified.

## Support
For questions or support, please contact our team.
    `,
    contact: {
      name: 'Give Life Support Team',
      email: 'support@givelife.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3000',
      description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'API health check endpoints',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error',
          },
          message: {
            type: 'string',
            example: 'An error occurred',
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success',
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully',
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
