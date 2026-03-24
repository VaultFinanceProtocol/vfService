export function okResponse<T>(data: T) {
  return {
    success: true,
    code: 200,
    message: 'Success',
    data,
    timestamp: new Date().toISOString(),
  };
}

export function createdResponse<T>(data: T) {
  return {
    success: true,
    code: 201,
    message: 'Created',
    data,
    timestamp: new Date().toISOString(),
  };
}
