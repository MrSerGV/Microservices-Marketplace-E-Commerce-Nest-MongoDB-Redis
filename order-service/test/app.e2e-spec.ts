import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ClientSession } from 'mongoose';

import { OrderModule } from '../src/orders/order.module';
import { OrderRepository } from '../src/orders/order.repository';
import { CreateOrderDto, UpdateOrderDto } from '../src/orders/order.dto';
import { OrderStatus } from '../src/orders/order.schema';

describe('OrderModule (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let orderRepository: OrderRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        OrderModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    orderRepository = moduleFixture.get<OrderRepository>(OrderRepository);
  });

  afterAll(async () => {
    await mongoServer.stop();
    await app.close();
  });

  describe('POST /orders/create', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        price: 100,
        quantity: 2,
        productId: '12345',
        customerId: '67890',
        sellerId: 'a8098c1a-f86e-11da-bd1a-00112444be1e',
      };

      const response = await request(app.getHttpServer())
          .post('/orders/create')
          .send(createOrderDto)
          .expect(201);

      expect(response.body).toMatchObject({
        price: 100,
        quantity: 2,
        productId: '12345',
        customerId: '67890',
        sellerId: 'a8098c1a-f86e-11da-bd1a-00112444be1e',
        status: OrderStatus.Created,
      });
    });
  });

  describe('GET /orders', () => {
    it('should return all orders', async () => {
      const response = await request(app.getHttpServer())
          .get('/orders')
          .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('GET /orders/:id', () => {
    it('should return order details', async () => {
      const session: ClientSession = await orderRepository.startTransaction();
      const order = await orderRepository.createOrderInstance(
          { price: 100, quantity: 2, productId: '12345', customerId: '67890', sellerId: 'a8098c1a-f86e-11da-bd1a-00112444be1e' },
          session
      );
      await orderRepository.save(order, session);

      const response = await request(app.getHttpServer())
          .get(`/orders/${order.orderId}`)
          .expect(200);

      expect(response.body.orderId).toBe(order.orderId);
    });

    it('should return 404 if order not found', async () => {
      await request(app.getHttpServer())
          .get(`/orders/non-existent-id`)
          .expect(404);
    });
  });

  describe('PATCH /orders/:id/update', () => {
    it('should update an order', async () => {
      const session: ClientSession = await orderRepository.startTransaction();
      const order = await orderRepository.createOrderInstance(
          { price: 100, quantity: 2, productId: '12345', customerId: '67890', sellerId: 'a8098c1a-f86e-11da-bd1a-00112444be1e' },
          session,
      );
      await orderRepository.save(order, session);

      const updateDto: UpdateOrderDto = { price: 200, quantity: 3, status: OrderStatus.Accepted };

      const response = await request(app.getHttpServer())
          .patch(`/orders/${order.orderId}/update`)
          .send(updateDto)
          .expect(200);

      expect(response.body).toMatchObject(updateDto);
    });

    it('should return 404 if order does not exist', async () => {
      const updateDto: UpdateOrderDto = { price: 200, quantity: 3, status: OrderStatus.Accepted };

      await request(app.getHttpServer())
          .patch('/orders/non-existent-id/update')
          .send(updateDto)
          .expect(404);
    });
  });
});
