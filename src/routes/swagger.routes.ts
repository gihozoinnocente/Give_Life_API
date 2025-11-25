import { Router, Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';

const router = Router();

const swaggerOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { 
      color: #dc2626; 
      font-size: 2.5rem; 
      border-bottom: 2px solid #dc2626;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .swagger-ui .info { 
      margin: 30px 0; 
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .swagger-ui .opblock-tag {
      font-size: 1.2rem;
      padding: 10px 15px;
      background: #f1f5f9;
      border-radius: 4px;
      margin: 10px 0;
    }
  `,
  customSiteTitle: 'Give Life API Documentation',
  customfavIcon: 'https://cdn-icons-png.flaticon.com/512/3209/3209265.png',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
    persistAuthorization: true,
  },
};

// Add CORS headers for Swagger UI
router.use((_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(swaggerSpec, swaggerOptions, {
    explorer: true,
    customSiteTitle: 'Give Life API Documentation',
  })
);

// Serve Swagger JSON
router.get('/swagger.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

export default router;
