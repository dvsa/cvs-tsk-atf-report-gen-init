/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Type } from './GenericClassDecorator';

/**
 * The Injector stores services and resolves requested instances.
 */
export const Injector = new (class {
  /**
   * Resolves instances by injecting required services
   * @param {Type<any>} target
   * @param {Type<any>} injections - optionally, you can override the expected injection with another one
   * @returns {T}
   */
  public resolve<T>(target: Type<any>, injections?: Array<Type<any>>): T {
    if (!injections) {
      // tokens are required dependencies, while injections are resolved tokens from the Injector
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const targetTokens =
        Reflect.getMetadata('design:paramtypes', target) || [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
      const targetInjections = targetTokens.map((token: any) =>
        Injector.resolve<any>(token),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return,new-cap
      return new target(...targetInjections);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const manualInjections: any = injections.map((token: any) =>
      Injector.resolve<any>(token),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,new-cap
    return new target(...manualInjections);
  }
})();
