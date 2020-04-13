import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { OpenIdConfiguration } from '../../lib/models/auth.configuration';
import { AuthModule } from '../../lib/modules/auth.module';
import { ConfigurationProvider } from '../../lib/services/auth-configuration.provider';
import { EqualityHelperService } from '../../lib/services/oidc-equality-helper.service';
import { LoggerService } from '../../lib/services/oidc.logger.service';
import { OidcSecurityStorage } from '../../lib/services/oidc.security.storage';
import { OidcSecurityValidation } from '../../lib/services/oidc.security.validation';
import { TestLogging } from '../common/test-logging.service';
import { TestStorage } from '../common/test-storage.service';

describe('OidcSecurityValidation', () => {
    let oidcSecurityValidation: OidcSecurityValidation;
    let configProvider: ConfigurationProvider;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [BrowserModule, HttpClientModule, RouterTestingModule, AuthModule.forRoot()],
            providers: [
                ConfigurationProvider,
                EqualityHelperService,
                OidcSecurityValidation,
                {
                    provide: OidcSecurityStorage,
                    useClass: TestStorage,
                },
                {
                    provide: LoggerService,
                    useClass: TestLogging,
                },
            ],
        });
    });

    beforeEach(() => {
        oidcSecurityValidation = TestBed.inject(OidcSecurityValidation);
        configProvider = TestBed.inject(ConfigurationProvider);
    });

    it('validate aud string', () => {
        const config: OpenIdConfiguration = {};
        config.stsServer = 'https://localhost:5001';
        config.redirectUrl = 'https://localhost:44386';
        config.clientId = '188968487735-b1hh7k87nkkh6vv84548sinju2kpr7gn.apps.googleusercontent.com';
        config.responseType = 'id_token token';
        config.scope = 'openid email profile';
        config.postLogoutRedirectUri = 'https://localhost:44386/Unauthorized';
        config.postLoginRoute = '/home';
        config.forbiddenRoute = '/Forbidden';
        config.unauthorizedRoute = '/Unauthorized';
        config.startCheckSession = false;
        config.silentRenew = false;
        config.silentRenewOffsetInSeconds = 0;
        config.logConsoleWarningActive = true;
        config.logConsoleDebugActive = true;
        config.maxIdTokenIatOffsetAllowedInSeconds = 10;

        configProvider.setup(config, null);

        const dataIdToken = { aud: 'banana' };
        const valueTrue = oidcSecurityValidation.validate_id_token_aud(dataIdToken, 'banana');
        expect(valueTrue).toEqual(true);

        const valueFalse = oidcSecurityValidation.validate_id_token_aud(dataIdToken, 'bananammmm');
        expect(valueFalse).toEqual(false);
    });

    it('validate aud array', () => {
        const config: OpenIdConfiguration = {};
        config.stsServer = 'https://localhost:5001';
        config.redirectUrl = 'https://localhost:44386';
        config.clientId = '188968487735-b1hh7k87nkkh6vv84548sinju2kpr7gn.apps.googleusercontent.com';
        config.responseType = 'id_token token';
        config.scope = 'openid email profile';
        config.postLogoutRedirectUri = 'https://localhost:44386/Unauthorized';
        config.postLoginRoute = '/home';
        config.forbiddenRoute = '/Forbidden';
        config.unauthorizedRoute = '/Unauthorized';
        config.startCheckSession = false;
        config.silentRenew = false;
        config.silentRenewOffsetInSeconds = 0;
        config.logConsoleWarningActive = true;
        config.logConsoleDebugActive = true;
        config.maxIdTokenIatOffsetAllowedInSeconds = 10;

        configProvider.setup(config, null);

        const dataIdToken = {
            aud: ['banana', 'apple', 'https://nice.dom'],
        };
        const valueTrue = oidcSecurityValidation.validate_id_token_aud(dataIdToken, ['banana', 'apple', 'https://nice.dom']);
        expect(valueTrue).toEqual(true);

        const valueFalse = oidcSecurityValidation.validate_id_token_aud(dataIdToken, ['ooo', 'apple', 'https://nice.dom']);
        expect(valueFalse).toEqual(false);
    });

    it('should validate id token nonce after code grant when match', () => {
        expect(oidcSecurityValidation.validate_id_token_nonce({ nonce: 'test1' }, 'test1', false)).toBe(true);
    });

    it('should not validate id token nonce after code grant when no match', () => {
        expect(oidcSecurityValidation.validate_id_token_nonce({ nonce: 'test1' }, 'test2', false)).toBe(false);
    });

    it('should validate id token nonce after refresh token grant when undefined and no ignore', () => {
        expect(
            oidcSecurityValidation.validate_id_token_nonce({ nonce: undefined }, OidcSecurityValidation.RefreshTokenNoncePlaceholder, false)
        ).toBe(true);
    });

    it('should validate id token nonce after refresh token grant when undefined and ignore', () => {
        expect(
            oidcSecurityValidation.validate_id_token_nonce({ nonce: undefined }, OidcSecurityValidation.RefreshTokenNoncePlaceholder, true)
        ).toBe(true);
    });

    it('should validate id token nonce after refresh token grant when defined and ignore', () => {
        expect(
            oidcSecurityValidation.validate_id_token_nonce({ nonce: 'test1' }, OidcSecurityValidation.RefreshTokenNoncePlaceholder, true)
        ).toBe(true);
    });

    it('should not validate id token nonce after refresh token grant when defined and no ignore', () => {
        expect(
            oidcSecurityValidation.validate_id_token_nonce({ nonce: 'test1' }, OidcSecurityValidation.RefreshTokenNoncePlaceholder, false)
        ).toBe(false);
    });
});
