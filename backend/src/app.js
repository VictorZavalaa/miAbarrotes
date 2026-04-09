const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const env = require('./config/env');

const healthRoutes = require('./routes/health.routes');
const productsRoutes = require('./routes/products.routes');
const salesRoutes = require('./routes/sales.routes');
const suppliersRoutes = require('./routes/suppliers.routes');
const purchasesRoutes = require('./routes/purchases.routes');
const supplierVisitsRoutes = require('./routes/supplierVisits.routes');
const loginRoutes = require('./routes/users.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

fs.mkdirSync(env.mediaRoot, { recursive: true });

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
);
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/media', express.static(env.mediaRoot));

app.use('/api/health', healthRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/supplier-visits', supplierVisitsRoutes);
app.use('/api/login', loginRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
