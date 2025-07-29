const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RentOwl API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'RentOwl API Docs',
    customfavIcon: '/images/logo2.png',
    customCss: `
      .swagger-ui .topbar { background: #FFF8F0; }
      .swagger-ui .topbar-wrapper::before {
        content: '';
        display: block;
        background: url('/images/logo2.png') no-repeat left center;
        background-size: 48px 48px;
        height: 48px;
        width: 48px;
        margin-right: 16px;
        float: left;
      }
      .swagger-ui .topbar-wrapper span { display: none !important; }
    `
  }));
}

module.exports = setupSwagger;
