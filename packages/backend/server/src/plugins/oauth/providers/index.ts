import { GithubOAuthProvider } from './github';
import { GoogleOAuthProvider } from './google';
import { OIDCProvider } from './oidc';
import { UniversoOAuthProvider } from './universo';

export const OAuthProviders = [
  GoogleOAuthProvider,
  GithubOAuthProvider,
  OIDCProvider,
  UniversoOAuthProvider,
];
