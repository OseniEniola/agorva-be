import { BaseResponse, PaginatedResponse } from "../interfaces/api-response";

export class ResponseUtil {
  static success(
    data: any,
    message: string = 'Operation successful',
  ): BaseResponse {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    message: string,
    code: string = 'INTERNAL_ERROR',
    details?: any,
  ): BaseResponse {
    return {
      success: false,
      message,
      error: {
        code,
        details,
      },
      timestamp: new Date().toISOString(),
    };
  }

  static paginated(
    data: any[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Data retrieved successfully',
  ): PaginatedResponse<any>{
    return {
      success: true,
      message,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }
}