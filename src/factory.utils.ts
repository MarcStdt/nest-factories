import {
  Inject,
  Provider,
  ValueProvider,
  FactoryProvider,
  ExistingProvider,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

export type FactoryFunction<T> = (token: string) => T;

export interface FactoryOptions {
  strict?: boolean;
}

type FactorySupportedProvider =
  | ValueProvider
  | FactoryProvider
  | ExistingProvider;

export interface FactoryLayout {
  [factory: string]: FactorySupportedProvider[];
}

const facoryKeyPrefix = 'Factory';

const createFactoryFunction = (slug: string, moduleRef: ModuleRef, options: FactoryOptions) => (
  tag: string,
): FactoryFunction<unknown> => {
  return moduleRef.get(`${facoryKeyPrefix}-${slug}-${tag}`, { strict: options.strict });
};

export function createFactories(factoryLayout: FactoryLayout, options: FactoryOptions = {}): Provider[] {
  let providers = [];
  for (const slug in factoryLayout) {
    providers.push({
      provide: `${facoryKeyPrefix}-${slug}`,
      useFactory: (moduleRef: ModuleRef) => {
        return createFactoryFunction(slug, moduleRef, options);
      },
      inject: [ModuleRef],
    });

    providers = providers.concat(
      factoryLayout[slug].map((p: FactorySupportedProvider) => {
        return {
          ...p,
          provide: `${facoryKeyPrefix}-${slug}-${p.provide.toString()}`,
        };
      }),
    );
  }
  return providers;
}

export function Factory(
  slug: string,
): (
  target: Record<string, unknown>,
  key: string | symbol,
  index?: number,
) => void {
  return Inject(`${facoryKeyPrefix}-${slug}`);
}
