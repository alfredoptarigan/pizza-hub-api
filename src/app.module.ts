import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartsModule } from './modules/carts/carts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { OutletsModule } from './modules/outlets/outlets.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ProductsModule, CategoriesModule, CartsModule, OrdersModule, PaymentsModule, OutletsModule, VouchersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
