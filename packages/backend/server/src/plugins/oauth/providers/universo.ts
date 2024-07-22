import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { Config, URLHelper } from '../../../fundamentals';
import { OAuthProviderName } from '../config';
import { AutoRegisteredOAuthProvider } from '../register';

interface UniversoOAuthTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export interface UserInfo {
  id: string;
  email: string;
  picture: string;
  name: string;
}

@Injectable()
export class UniversoOAuthProvider extends AutoRegisteredOAuthProvider {
  override provider = OAuthProviderName.Universo;

  constructor(
    protected readonly AFFiNEConfig: Config,
    private readonly url: URLHelper
  ) {
    super();
  }

  getAuthUrl(state: string) {
    return `https://t34.universo.pro/o/authorize/?${this.url.stringify({
      client_id: this.config.clientId,
      redirect_uri: this.url.link('/oauth/callback'),
      response_type: 'code',
      scope: 'read write',
      code_challenge_method: 'S256',
      state,
    })}`;
  }

  async getToken(code: string) {
    try {
      const response = await fetch('https://t34.universo.pro/o/token/', {
        method: 'POST',
        body: this.url.stringify({
          code,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.url.link('/oauth/callback'),
          grant_type: 'authorization_code',
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.ok) {
        const tokenResponse =
          (await response.json()) as UniversoOAuthTokenResponse;

        return {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
          scope: tokenResponse.scope,
        };
      } else {
        throw new Error(
          `Server responded with non-success code ${
            response.status
          }, ${JSON.stringify(await response.json())}`
        );
      }
    } catch (e) {
      throw new HttpException(
        `Failed to get access_token, err: ${(e as Error).message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getUser(token: string) {
    try {
      const response = await fetch(
        'https://t34.universo.pro/api/v1.1/jwt/', // Замените на актуальный URL для получения информации о пользователе
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const user = (await response.json()) as UserInfo;

        return {
          id: user.id,
          avatarUrl: user.picture,
          email: user.email,
        };
      } else {
        throw new Error(
          `Server responded with non-success code ${
            response.status
          } ${await response.text()}`
        );
      }
    } catch (e) {
      throw new HttpException(
        `Failed to get user information, err: ${(e as Error).stack}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
