import { Test, TestingModule } from '@nestjs/testing';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderPathParamDto, SellerPathParamDto, UpdateOrderDto } from './order.dto';
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
  status: OrderStatus.Accepted,
  ...overrides,
});

const createMockOrderPathParamDto = (overrides = {}): OrderPathParamDto => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  ...overrides,
});

const createMockSellerPathParamDto = (overrides = {}): SellerPathParamDto => ({
  id: 'a8098c1a-f86e-11da-bd1a-00112444be1e',
  ...overrides,
});

describe('OrderController', () => {
  let orderController: OrderController;
  let orderService: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            createOrder: jest.fn(),
            listOrdersBySellerId: jest.fn(),
            getOrderDetails: jest.fn(),
            updateOrder: jest.fn(),
          },
        },
      ],
    }).compile();

    orderController = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(orderController).toBeDefined();
  });

  describe('createOrder', () => {
    it('should return the created order when valid data is provided', async () => {
      const mockOrder = createMockOrder();
      jest.spyOn(orderService, 'createOrder').mockResolvedValue(mockOrder);

      const result = await orderController.createOrder(createMockCreateOrderDto());

      expect(orderService.createOrder).toHaveBeenCalledWith(createMockCreateOrderDto());
      expect(result).toEqual(mockOrder);
    });

    it('should throw an error if orderService.createOrder fails', async () => {
      jest.spyOn(orderService, 'createOrder').mockRejectedValue(new Error('Order creation failed'));

      await expect(orderController.createOrder(createMockCreateOrderDto())).rejects.toThrow(
          'Order creation failed',
      );
      expect(orderService.createOrder).toHaveBeenCalledWith(createMockCreateOrderDto());
    });
  });

  describe('listOrdersBySellerId', () => {
    it('should return a list of orders on success', async () => {
      const mockOrderList = [createMockOrder(), createMockOrder({ orderId: 'a8098c1a-f86e-11da-bd1a-00112444be11' })];
      jest.spyOn(orderService, 'listOrdersBySellerId').mockResolvedValue(mockOrderList);

      const result = await orderController.listOrders(createMockSellerPathParamDto());

      expect(orderService.listOrdersBySellerId).toHaveBeenCalled();
      expect(result).toEqual(mockOrderList);
    });

    it('should throw an error if orderService.listOrders fails', async () => {
      jest.spyOn(orderService, 'listOrdersBySellerId').mockRejectedValue(new Error('Failed to fetch orders'));

      await expect(orderController.listOrders(createMockSellerPathParamDto())).rejects.toThrow('Failed to fetch orders');
      expect(orderService.listOrdersBySellerId).toHaveBeenCalled();
    });
  });

  describe('getOrderDetails', () => {
    it('should return order details for a valid ID', async () => {
      const mockOrder = createMockOrder();
      jest.spyOn(orderService, 'getOrderDetails').mockResolvedValue(mockOrder);

      const result = await orderController.getOrderDetails(createMockOrderPathParamDto());

      expect(orderService.getOrderDetails).toHaveBeenCalledWith((createMockOrderPathParamDto()).id);
      expect(result).toEqual(mockOrder);
    });

    it('should throw an error if getOrderDetails fails', async () => {
      jest.spyOn(orderService, 'getOrderDetails').mockRejectedValue(new Error('Order not found'));

      await expect(orderController.getOrderDetails(createMockOrderPathParamDto())).rejects.toThrow(
          'Order not found',
      );
      expect(orderService.getOrderDetails).toHaveBeenCalledWith((createMockOrderPathParamDto()).id);
    });
  });

  describe('updateOrder', () => {
    it('should return the updated order when valid data is provided', async () => {
      const updatedOrder = createMockOrder({
        price: 150,
        quantity: 3,
        status: OrderStatus.Accepted,
      });
      jest.spyOn(orderService, 'updateOrder').mockResolvedValue(updatedOrder);

      const result = await orderController.updateOrder(
          createMockOrderPathParamDto(),
          createMockUpdateOrderDto(),
      );

      expect(orderService.updateOrder).toHaveBeenCalledWith(
          createMockOrderPathParamDto(),
          createMockUpdateOrderDto(),
      );
      expect(result).toEqual(updatedOrder);
    });

    it('should throw an error if updateOrder fails', async () => {
      jest.spyOn(orderService, 'updateOrder').mockRejectedValue(new Error('Failed to update order'));

      await expect(
          orderController.updateOrder(createMockOrderPathParamDto(), createMockUpdateOrderDto()),
      ).rejects.toThrow('Failed to update order');
      expect(orderService.updateOrder).toHaveBeenCalledWith(
          createMockOrderPathParamDto(),
          createMockUpdateOrderDto(),
      );
    });
  });
});
