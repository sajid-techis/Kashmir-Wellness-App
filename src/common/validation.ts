// File: kashmir-wellness-backend/src/common/validation.ts

import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  PORT: Joi.number().default(3000),

  // Database
  MONGODB_URI: Joi.string().required(),
  REDIS_URI: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION_TIME: Joi.string().default('3600s'),

  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),

  // Razorpay
  RAZORPAY_KEY_ID: Joi.string().required(),
  RAZORPAY_KEY_SECRET: Joi.string().required(),
  RAZORPAY_WEBHOOK_SECRET: Joi.string().required(),
});