require('dotenv-safe').config();

const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');

const app = express();
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading resources like images from other origins (or same origin if static) - crucial for serving /uploads
}));

// Prevent Parameter Pollution
// Prevent Parameter Pollution
// app.use(hpp());

// Sanitize Data (XSS)
// app.use(xss());

// Rate Limiting (Global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply rate limiter to all api routes
app.use('/api', limiter);

// Serve static files from public/uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Log incoming requests
app.use(loggerMiddleware); // Add logger middleware

// Sync database
db.sequelize.sync({ alter: true }).then(() => {
  logger.info('Database synced successfully.');
}).catch(err => {
  logger.error(`Error syncing database: ${err.message}`);
});

// Routes
const routes = require('./routes');
const artistRoutes = require('./routes/artist.routes');

app.use('/api', routes);
app.use('/api/artists', artistRoutes);
app.use('/api/labels', require('./routes/label.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/admin', require('./routes/admin.routes')); // Added Admin routes
app.use('/api/activity', require('./routes/activity.routes')); // Activity Feed

// Load Swagger YAML file
let swaggerDocument;
try {
  swaggerDocument = YAML.load('./swagger.yaml');
  logger.info('Swagger documentation loaded successfully.');
} catch (err) {
  logger.error(`Failed to load Swagger documentation: ${err.message}`);
  process.exit(1); // Exit the application if Swagger fails to load
}

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
logger.info('Swagger documentation available at http://localhost:3000/api-docs');

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

// Error handling middleware
app.use(errorHandler);

// Example error handling
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({ message: err.message });
});

module.exports = app;