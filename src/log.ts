import consola from 'consola';

export class Log {
  public info(message: string): void {
    const timestamp = new Date().toISOString();
    consola.info(`${timestamp} | ${message}`);
  }
  public success(message: string): void {
    const timestamp = new Date().toISOString();
    consola.success(`${timestamp} | ${message}`);
  }
  public error<T = unknown>(error: T): void {
    consola.error(error);
  }
}
