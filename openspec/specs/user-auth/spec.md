# user-auth Specification

## Purpose

JWT auth pipeline: login form, credential exchange, session persistence, route protection, API credential attachment.

## Requirements

### Requirement: User Model

The system MUST define a `User` interface matching the backend auth response (id, email, displayName, roles, token).

#### Scenario: Deserialize from login response

- GIVEN a `POST /auth/login` success response
- WHEN deserializing the JSON body
- THEN all `User` fields SHALL match the backend contract

### Requirement: AuthService — Login, Logout, Signals

`AuthService` MUST expose `login()`, `logout()`, a `user()` signal, and a computed `isAuthenticated()`.

#### Scenario: Login success

- GIVEN valid credentials
- WHEN `login()` is called
- THEN the service SHALL `POST /auth/login`, store JWT in localStorage, update `user()`, and `isAuthenticated()` SHALL return `true`

#### Scenario: Login 401

- GIVEN invalid credentials
- WHEN `login()` is called
- THEN the service SHALL NOT mutate signals or storage, and SHALL propagate the error

#### Scenario: Login network failure

- GIVEN the backend is unreachable
- WHEN `login()` is called
- THEN the service SHALL throw without mutating signals or storage

#### Scenario: Logout

- GIVEN an authenticated session
- WHEN `logout()` is called
- THEN localStorage SHALL be cleared, `user()` SHALL be `null`, `isAuthenticated()` SHALL return `false`

### Requirement: Session Restoration

On app boot the system MUST check localStorage and rehydrate user state from a stored JWT.

#### Scenario: Valid stored token

- GIVEN a JWT in localStorage
- WHEN the app initializes
- THEN `AuthService` SHALL decode claims, populate `user()`, and `isAuthenticated()` SHALL return `true`

#### Scenario: Expired stored token

- GIVEN an expired JWT in localStorage
- WHEN the app initializes
- THEN the system SHALL clear the token, set `user()` to `null`, and NOT attempt API calls

#### Scenario: Empty storage

- GIVEN no JWT in localStorage
- WHEN the app initializes
- THEN `isAuthenticated()` SHALL return `false` and `user()` SHALL be `null`

### Requirement: JWT Interceptor

The interceptor MUST attach `Authorization: Bearer <token>` to `HttpClient` requests when authenticated

#### Scenario: Authenticated request

- GIVEN a valid JWT in AuthService
- WHEN any `HttpClient` method fires
- THEN the interceptor SHALL add the `Authorization` header

#### Scenario: 401 triggers logout

- GIVEN an authenticated session
- WHEN the backend responds with 401
- THEN the interceptor SHALL call `logout()` and clear session state

#### Scenario: Unauthenticated request

- GIVEN no authenticated user
- WHEN any `HttpClient` method fires
- THEN the interceptor SHALL pass the request unmodified without `Authorization`

### Requirement: AuthGuard

The guard MUST block unauthenticated navigation and redirect to `/auth/login`.

#### Scenario: Authenticated user

- GIVEN `isAuthenticated()` returns `true`
- WHEN navigating to a guarded route
- THEN the guard SHALL return `true`

#### Scenario: Unauthenticated user

- GIVEN `isAuthenticated()` returns `false`
- WHEN navigating to a guarded route
- THEN the guard SHALL return a `UrlTree` to `/auth/login`.

### Requirement: Login Component

`LoginComponent` MUST render a Material form (email, password), call `AuthService.login()`, show errors, and redirect to `/dashboard` on success.

#### Scenario: Successful login

- GIVEN valid credentials
- WHEN submitted
- THEN the component SHALL call `login()`, navigate to `/dashboard`, and show no errors

#### Scenario: Login failure with error

- GIVEN invalid credentials
- WHEN submitted
- THEN the component SHALL display an error, NOT navigate, and keep the form enabled

#### Scenario: Network error

- GIVEN the backend is unreachable
- WHEN submitted
- THEN the component SHALL display generic error and NOT navigate

#### Scenario: Empty form validation

- GIVEN empty fields
- WHEN the user clicks submit
- THEN the component SHALL show field validation and NOT call `login()`

#### Scenario: Authenticated user at login

- GIVEN `isAuthenticated()` is `true`
- WHEN visiting `/auth/login`
- THEN the component SHALL redirect to `/dashboard`

### Requirement: Route Protection

`/dashboard` MUST apply `canActivate: [authGuard]`.

#### Scenario: Dashboard guarded

- GIVEN route configuration
- WHEN accessing `/dashboard`
- THEN the route SHALL have `canActivate` with `authGuard`
