import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { notFound } from './utils/notFound';
import { errorHandler } from './utils/errorHandler';

const app = express();
dotenv.config();


app.use(cors());
app.use(express.json());
app.use(cookieParser());


// Importing admin routes
import adminAuthRoutes from './modules/admin/routes/auth.routes';
import adminRoutes from './modules/admin/routes/admin.routes';

// Importing user routes
import authRoutes from './modules/user/routes/auth.routes';
import userRoutes from './modules/user/routes/user.routes';

// Importing listing routes
import listingRoutes from './modules/user/routes/listing.routes';

// Importing connects routes
import connectsRoutes from './modules/user/routes/connects.routes';

// Importing conversation routes
import conversationRoutes from './modules/user/routes/conversation.routes';

// Importing order routes
import orderRoutes from './modules/user/routes/order.routes';

// Routes
// Admin routes
app.use('/api/v1/admin/auth', adminAuthRoutes);
app.use('/api/v1/admin', adminRoutes)


//user routes
app.use('/api/v1/user/auth', authRoutes);
app.use('/api/v1/user', userRoutes);

// Listing routes
app.use('/api/v1/user/listings', listingRoutes);

// Connects routes
app.use('/api/v1/user/connects', connectsRoutes);

// Conversation routes
app.use('/api/v1/user/conversations', conversationRoutes);

//Order routes
app.use('/api/v1/user/orders', orderRoutes);



// 404 & Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
