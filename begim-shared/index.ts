// Begim — общий слой данных для всех клиентов (Mini App, бэк-офис, позже мобилка).
// Подключается через path-alias `@begim/shared` в каждом vite-приложении.
//
//   import { configureApi, ensureSession, listProducts } from '@begim/shared';

export * from './types';
export * from './http';
export * from './auth';
export * from './endpoints';
export * from './admin';
export * from './format';
