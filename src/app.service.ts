import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis'; // Import InjectRedis
import Redis from 'ioredis'; // Import Redis type from ioredis

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    @InjectConnection() private mongooseConnection: Connection, // Renamed to avoid conflict
    @InjectRedis() private redisClient: Redis, // Inject the Redis client
  ) {}

  async onApplicationBootstrap() {
    // MongoDB Connection Check
    if (this.mongooseConnection.readyState === 1) {
      console.log('MongoDB connection successful! (from AppService lifecycle hook)');
      console.log(`Connected to database: ${this.mongooseConnection.name}`);
      this.mongooseConnection.on('disconnected', () => {
        console.log('MongoDB disconnected! (from AppService event listener)');
      });
      this.mongooseConnection.on('error', (err) => {
        console.error(`MongoDB connection error! (from AppService event listener): ${err}`);
      });
    } else {
      console.error('MongoDB connection failed! (from AppService lifecycle hook)');
    }

    // Redis Connection Check
    // ioredis client emits 'ready' event on successful connection
    this.redisClient.on('ready', () => {
      console.log('Redis connection successful! (from AppService event listener)');
    });
    this.redisClient.on('error', (err) => {
      console.error(`Redis connection error! (from AppService event listener): ${err.message}`);
    });

    // You can also check initial status, though 'ready' is better for long-running apps
    if (this.redisClient.status === 'ready') {
      console.log('Redis is already connected upon bootstrap.');
    } else {
      console.log(`Redis status: ${this.redisClient.status} (waiting for 'ready' event)`);
    }

    // Example: Try to set and get a value in Redis to confirm functionality
    try {
      await this.redisClient.set('nest-status', 'Redis connected via NestJS!');
      const status = await this.redisClient.get('nest-status');
      console.log(`Redis test value: ${status}`);
    } catch (error) {
      console.error(`Failed Redis test operation: ${error.message}`);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}