import { Test } from '@nestjs/testing';
import { FactoryModule } from './factory.module';
import { Injectable, Module } from '@nestjs/common';
import { createFactories, Factory, FactoryFunction } from './factory.utils';

@Injectable()
class TestChildService {
  constructor(
    @Factory('test') private testFactory: FactoryFunction<{ text: string }>
  ) {}

  getTestProvider(slug: string) {
    return this.testFactory(slug);
  }
}
const childLayout = {
  test: [
    {
      provide: 'test-child',
      useValue: { text: 'test-child' },
    },
  ],
};
const childFactories = createFactories(childLayout, {strict: false});//TODO move strict config do registerFactory and handle it global per factory
@Module({
  imports: [],
  providers: [TestChildService, ...childFactories],
  exports: [TestChildService, ...childFactories],
})
export class ChildModule {}

@Injectable()
class TestService {
  constructor(
    @Factory('test') private testFactory: FactoryFunction<{ text: string }>,
  ) {}

  getTestProvider(slug: string) {
    return this.testFactory(slug);
  }
}

describe('FactoryModule', () => {
  let testService: TestService;
  let testChildService: TestChildService;

  const factories = {
    test: [
      {
        provide: 'test-provider1',
        useValue: { text: 'test-1' },
      },
    ],
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ChildModule, FactoryModule.register(factories)],
      providers: [TestService],
    }).compile();

    testService = moduleRef.get<TestService>(TestService);
    testChildService = moduleRef.get<TestChildService>(TestChildService);
  });

  describe('root provider', () => {
    it('should return non strict factory with registered providers', async () => {
      expect(testService.getTestProvider('test-child')).toHaveProperty('text');
      expect(testService.getTestProvider('test-child').text).toBe('test-child');
      expect(testService.getTestProvider('test-provider1')).toHaveProperty('text');
      expect(testService.getTestProvider('test-provider1').text).toBe('test-1');
    });
  });

  describe('child provider', () => {
    it('should return non strict factory with registered providers', async () => {
      expect(testChildService.getTestProvider('test-child')).toHaveProperty('text');
      expect(testChildService.getTestProvider('test-child').text).toBe('test-child');
      expect(testChildService.getTestProvider('test-provider1')).toHaveProperty('text');
      expect(testChildService.getTestProvider('test-provider1').text).toBe('test-1');
    });
  });
});
