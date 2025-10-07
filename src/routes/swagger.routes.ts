import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';

const router = Router();

const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #dc2626; font-size: 2.5rem; }
    .swagger-ui .info { margin: 50px 0; }
  `,
  customSiteTitle: 'Give Life API Documentation',
  customfavIcon: 'https://cdn-icons-png.flaticon.com/512/3209/3209265.png',
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, swaggerOptions));

export default router;
