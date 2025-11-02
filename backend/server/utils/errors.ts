export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public status: 'fail' | 'error' = 'error'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
