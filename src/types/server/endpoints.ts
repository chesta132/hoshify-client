type Root = "/";
type Dynamic = `/${string}${string}`;
type Branch = `/${string}`;
type DynamicRestore = `/restores/${string}${string}`;
type Restores = "/restores";
type OffsetQuery = `offset=${number}`;

export type AuthEndpoints = {
  get: "/google" | "/google/callback" | "/send-email-verif" | "/google-bind" | "/google-bind/callback";
  post: "/signup" | "/signin" | "/signout" | "/verify-email" | "/send-otp" | "/request-role";
  put: "/bind-local" | "/update-email" | "/reset-password" | "/update-password" | "/accept-request-role";
  delete: never;
  patch: never;
};

export type UserEndpoints = {
  get: "/initiate" | Root;
  delete: Root;
  put: Root;
  patch: never;
  post: never;
};

export type TodoEndpoints = {
  get: Branch;
  post: Root;
  put: Branch;
  delete: Branch;
  patch: Restores | DynamicRestore;
};

export type TransactionEndpoints = {
  get: Branch;
  post: Root;
  put: Dynamic;
  delete: Branch;
  patch: Restores | DynamicRestore;
};

export type ScheduleEndpoints = {
  get: Branch;
  post: Root;
  put: Branch;
  delete: Branch;
  patch: Restores | DynamicRestore;
};

export type LinkEndpoints = {
  get: Root | (`${Root}?${OffsetQuery}` | (string & {}));
  post: Root;
  put: Dynamic | Root
  delete: Branch;
  patch: never;
};

export type MoneyEndpoints = {
  get: Root;
  put: Dynamic;
  patch: DynamicRestore;
  post: never;
  delete: never;
};

export type Endpoints = AuthEndpoints | UserEndpoints | TodoEndpoints | TransactionEndpoints | ScheduleEndpoints | LinkEndpoints | MoneyEndpoints;
