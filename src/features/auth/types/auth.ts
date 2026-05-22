export type LoginUserType = "tenant" | "driver";

export type LoginCredentials = {
  email: string;
  password: string;
  userType: LoginUserType;
};

export type AuthUser = Record<string, any>;

export type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: AuthUser;
};

export type ForgotPasswordResponse = {
  message: string;
  reset_url?: string;
  reset_token?: string;
};
