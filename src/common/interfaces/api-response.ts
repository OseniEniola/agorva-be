import { PaginationMeta } from "./paginated-response";

export class BaseResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T> extends BaseResponse {
  data: T[];
  meta: PaginationMeta
}
