import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ItemModule } from './item/item.module';
import { OutfitModule } from './outfit/outfit.module';
import { RfidModule } from './rfid/rfid.module';
import { UserModule } from './user/user.module';
import { ValidationMiddleware } from './common/middleware/validation.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { MailingModule } from './mailing/mailing.module';
import { SettingsModule } from './settings/settings.module';
import { MediaModule } from './media/media.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { WeatherModule } from './weather/weather.module';
import { User } from './user/entities/user.entity.js';
import { UserStylePreference } from './user/entities/user-style-preferences.entity.js';
import { UserColorPreference } from './user/entities/user-color-preferences.entity.js';
import { UserLifestyle } from './user/entities/user-lifestyle.entity.js';
import { UserOccasion } from './user/entities/user-occasion.entity.js';
import { Item } from './item/entities/item.entity.js';
import { Outfit } from './outfit/entities/outfit.entity.js';
import { RfidDevice } from './rfid/entities/rfid-device.entity.js';
import { RfidTag } from './rfid/entities/rfid-tag.entity.js';
import { Media } from './media/entities/media.entity.js';
import { Recommendation } from './recommendation/entities/recommendation.entity.js';

// Make database connection optional
const databaseImports = [];
if (process.env.DATABASE_URL) {
  console.log('Database URL found, enabling database connection');
  databaseImports.push(
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        User,
        UserStylePreference,
        UserColorPreference,
        UserLifestyle,
        UserOccasion,
        Item,
        Outfit,
        RfidDevice,
        RfidTag,
        Media,
        Recommendation
      ],
      synchronize: process.env.NODE_ENV !== 'production',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      logging: process.env.NODE_ENV === 'development'
    })
  );
} else {
  console.log('No DATABASE_URL found, running without database');
}

@Module({
  imports: [
    ...databaseImports,
    UserModule,
    AuthModule,
    ItemModule,
    OutfitModule,
    RfidModule,
    MailingModule,
    SettingsModule,
    MediaModule,
    DashboardModule,
    AnalyticsModule,
    WeatherModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer) {
    consumer
      .apply(LoggerMiddleware, ValidationMiddleware)
      .forRoutes('user');
  }
}