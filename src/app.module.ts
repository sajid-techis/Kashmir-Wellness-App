// File: kashmir-wellness-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { validationSchema } from './common/validation'; // <-- NEW: Import validation schema

// Import ALL your modules here
import { PatientsModule } from './patients/patients.module';
import { ProductsModule } from './products/products.module';
import { AddressesModule } from './addresses/addresses.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ReviewsModule } from './reviews/reviews.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { DoctorsModule } from './doctors/doctors.module';
import { LabsModule } from './labs/labs.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ProvidersModule } from './providers/providers.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    // --- THIS IS THE MODIFIED PART ---
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema, // <-- NEW: Add the validation schema here
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'single',
        url: configService.get<string>('REDIS_URI'),
      }),
      inject: [ConfigService],
    }),

    // ... (rest of the modules remain the same)
    PatientsModule,
    ProductsModule,
    AddressesModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    ReviewsModule,
    OrdersModule,
    CartModule,
    DoctorsModule,
    LabsModule,
    HospitalsModule,
    AppointmentsModule,
    ProvidersModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}