import { defineStartupConfig, ModuleConfig } from '../../fundamentals/config';

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  args?: Record<string, string>;
}

export type OIDCArgs = {
  scope?: string;
  claim_id?: string;
  claim_email?: string;
  claim_name?: string;
};

export interface OAuthOIDCProviderConfig extends OAuthProviderConfig {
  issuer: string;
  args?: OIDCArgs;
}

export interface OAuthUniversoProviderConfig extends OAuthProviderConfig {
  issuer: string;
  args?: OIDCArgs & { code_challenge_method: string; redirect_uri: string };
}

export enum OAuthProviderName {
  Google = 'google',
  GitHub = 'github',
  OIDC = 'oidc',
  Universo = 'universo',
}

type OAuthProviderConfigMapping = {
  [OAuthProviderName.Google]: OAuthProviderConfig;
  [OAuthProviderName.GitHub]: OAuthProviderConfig;
  [OAuthProviderName.OIDC]: OAuthOIDCProviderConfig;
  [OAuthProviderName.Universo]: OAuthUniversoProviderConfig;
};

export interface OAuthConfig {
  providers: Partial<OAuthProviderConfigMapping>;
}

declare module '../config' {
  interface PluginsConfig {
    oauth: ModuleConfig<OAuthConfig>;
  }
}

defineStartupConfig('plugins.oauth', {
  providers: {},
});
