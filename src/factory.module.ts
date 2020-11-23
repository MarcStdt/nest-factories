import { Module, DynamicModule } from '@nestjs/common';
import { createFactories, FactoryLayout } from './factory.utils';

@Module({})
export class FactoryModule {
  static register(factoryLayout: FactoryLayout): DynamicModule {
    const providers = createFactories(factoryLayout);
    return {
      module: FactoryModule,
      providers: [...providers],
      exports: [...providers],
    };
  }
}
