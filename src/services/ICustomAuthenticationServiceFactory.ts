import { ICustomAuthenticationService } from "./ICustomAuthenticationService";

export interface ICustomAuthenticationServiceFactory {
    createAuthService(): ICustomAuthenticationService
} 