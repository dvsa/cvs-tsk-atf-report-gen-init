/**
 * Type for what object is instances of
 */
export type Type<T> = new (...args: unknown[]) => T;

/**
 * Generic `ClassDecorator` type
 */
export type GenericClassDecorator<T> = (target: T) => void;
