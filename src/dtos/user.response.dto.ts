export type userIdentity = {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: {
    email: string;
    email_verified: boolean;
    phone_verified: boolean;
    sub: string;
  };
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
};
export interface UserResponseDTO {
  session: {
    access_token: string;
    token_type: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
  };
  user: {
    id: string;
    aud: string[];
    email: string;
    email_confirmed_at: string;
    phone: string;
    confirmation_sent_at: string;
    confirmed_at: string;
    last_sign_in_at: string;
    app_metadata: {
      provider: string;
      providers: string[];
    };
    user_metadata: {
      email: string;
      email_verified: boolean;
      phone_verified: boolean;
      sub: string;
    };
    identities: userIdentity[];
    created_at: string;
    updated_at: string;
    is_anonymous: boolean;
  };
}