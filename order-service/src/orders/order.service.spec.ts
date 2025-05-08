import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClientSession } from 'mongoose';

import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { MessagingService } from '../messaging/messaging.service';
import { CreateOrderDto, OrderPathParamDto, UpdateOrderDto, SellerPathParamDto } from './order.dto';
import { Order, OrderStatus } from './order.schema';


const createMockOrder = (overrides = {}): Order => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    price: 100,
    quantity: 2,
    productId: '12345',
    customerId: '67890',
    sellerId: 'a8098c1a-f86e-11da-bd1a-00112444be1e',
    status: OrderStatus.Created,
    ...overrides,
}) as Order;

const createMockCreateOrderDto = (overrides = {}): CreateOrderDto => ({
    price: 100,
    quantity: 2,
    productId: '12345',
    customerId: '67890',
    sellerId: 'a8098c1a-f86e-11da-bd1a-00112444be1e',
    ...overrides,
});

const createMockUpdateOrderDto = (overrides = {}): UpdateOrderDto => ({
    price: 150,
    quantity: 3,
    status: OrderStatus.Shipped,
    ...overrides,
});

const createMockOrderPathParamDto = (overrides = {}): OrderPathParamDto => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    ...overrides,
});

const createMockSellerPathParamDto = (overrides = {}): SellerPathParamDto => ({
    sellerId: 'a8098c1a-f86e-11da-bd1a-00112444be1e',
    ...overrides,
});

const session: ClientSession = {
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn()
} as unknown as ClientSession;

describe('OrderService', () => {
    let orderService: OrderService;
    let orderRepository: OrderRepository;
    let invoiceProducer: MessagingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: OrderRepository,
                    useValue: {
                        startTransaction: jest.fn(),
                        createAndSaveOrder: jest.fn(),
                        findBySellerId: jest.fn(),
                        findById: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: MessagingService,
                    useValue: {
                        sendOrderCreated: jest.fn(),
                        sendOrderShipped: jest.fn(),
                    },
                }
            ],
        }).compile();

        orderService = module.get<OrderService>(OrderService);
        orderRepository = module.get<OrderRepository>(OrderRepository);
        invoiceProducer = module.get<MessagingService>(MessagingService);
    });

    describe('createOrder', () => {
        it('should create and save an order successfully', async () => {
            jest.spyOn(orderRepository, 'startTransaction').mockResolvedValue(session);
            jest.spyOn(orderRepository, 'createAndSaveOrder').mockResolvedValue(createMockOrder());
            jest.spyOn(invoiceProducer, 'sendOrderCreated').mockResolvedValue();

            const result = await orderService.createOrder(createMockCreateOrderDto());

            expect(orderRepository.startTransaction).toHaveBeenCalled();
            expect(orderRepository.createAndSaveOrder).toHaveBeenCalledWith(createMockCreateOrderDto(), session);
            expect(invoiceProducer.sendOrderCreated).toHaveBeenCalledWith(createMockOrder().id);
            expect(session.commitTransaction).toHaveBeenCalled();
            expect(result).toEqual(createMockOrder());
        });

        it('should handle errors during order creation', async () => {
            jest.spyOn(orderRepository, 'startTransaction').mockResolvedValue(session);
            jest.spyOn(orderRepository, 'createAndSaveOrder').mockRejectedValue(new Error('Failed to create order'));

            await expect(orderService.createOrder(createMockCreateOrderDto())).rejects.toThrow('Failed to create order');
            expect(session.abortTransaction).toHaveBeenCalled();
        });
    });

    describe('listOrdersBySellerId', () => {
        it('should fetch and return all orders', async () => {
            jest.spyOn(orderRepository, 'findBySellerId').mockResolvedValue([createMockOrder()]);

            const result = await orderService.listOrdersBySellerId(createMockSellerPathParamDto().sellerId);

            expect(orderRepository.findBySellerId).toHaveBeenCalled();
            expect(result).toEqual([createMockOrder()]);
        });
    });

    describe('getOrderDetails', () => {
        it('should return order details when order exists', async () => {
            jest.spyOn(orderRepository, 'findById').mockResolvedValue(createMockOrder());

            const result = await orderService.getOrderDetails(createMockOrderPathParamDto().id);

            expect(orderRepository.findById).toHaveBeenCalledWith(createMockOrderPathParamDto().id);
            expect(result).toEqual(createMockOrder());
        });

        it('should throw NotFoundException when order does not exist', async () => {
            jest.spyOn(orderRepository, 'findById').mockResolvedValue(null);

            await expect(orderService.getOrderDetails(createMockOrderPathParamDto().id)).rejects.toThrow(NotFoundException);
            expect(orderRepository.findById).toHaveBeenCalledWith(createMockOrderPathParamDto().id);
        });
    });

    describe('updateOrder', () => {
        it('should update and save an order successfully', async () => {
            jest.spyOn(orderRepository, 'startTransaction').mockResolvedValue(session);
            jest.spyOn(orderRepository, 'findById').mockResolvedValue(createMockOrder());
            jest.spyOn(orderRepository, 'update').mockResolvedValue(createMockOrder({ status: OrderStatus.Shipped }));
            jest.spyOn(invoiceProducer, 'sendOrderShipped').mockResolvedValue();

            const result = await orderService.updateOrder(createMockOrderPathParamDto(), createMockUpdateOrderDto());

            expect(orderRepository.startTransaction).toHaveBeenCalled();
            expect(orderRepository.update).toHaveBeenCalledWith(createMockOrder(), createMockUpdateOrderDto(), session);
            expect(session.commitTransaction).toHaveBeenCalled();
            expect(result).toEqual(createMockOrder({ status: OrderStatus.Shipped }));
        });

        it('should handle errors during order update', async () => {
            jest.spyOn(orderRepository, 'startTransaction').mockResolvedValue(session);
            jest.spyOn(orderRepository, 'update').mockRejectedValue(new Error('Failed to update order'));
            const mockId = createMockOrderPathParamDto()

            await expect(
                orderService.updateOrder(createMockOrderPathParamDto(), createMockUpdateOrderDto()),
            ).rejects.toThrow(`Failed to update Order ID=${mockId.id}`);
            expect(session.abortTransaction).toHaveBeenCalled();
        });
    });
});
