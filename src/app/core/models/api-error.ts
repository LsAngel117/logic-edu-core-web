/** Backend error response body matching Spring Boot default + custom code extension. */
export interface ApiError {
  timestamp?: string;
  status: number;
  error?: string;
  /** Stable error code for i18n / cross-client consumption (future). */
  code?: string;
  message: string;
  path?: string;
}
