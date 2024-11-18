export type SuccessResponse<T = unknown> =
  | ({
      success: true;
    } & T)
  | {
      success: false;
      error: string;
    };
