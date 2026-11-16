export class ApiError extends Error {
  constructor(message, status = 0, code = 'ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}
