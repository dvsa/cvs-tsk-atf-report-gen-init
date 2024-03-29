/* eslint-disable @typescript-eslint/no-explicit-any */
import { GenericClassDecorator, Type } from './GenericClassDecorator';
import { Injector } from './Injector';

/**
 * @returns {GenericClassDecorator<Type<any>>}
 * @constructor
 */
export const Service =
  (): GenericClassDecorator<Type<any>> => (target: Type<any>) => {
    Injector.resolve<Type<any>>(target);
  };
