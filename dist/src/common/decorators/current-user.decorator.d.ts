export interface AuthUser {
    id: number;
    mobileNumber: string;
    roles: string[];
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
