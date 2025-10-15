import type { Link, Money, Note, Schedule, Todo, Transaction, User, UserRole } from "../models";

export type Root = "/";
export type Param = "/" | (string & {});
export type Query<Q extends string = string, V extends Exclude<AllType, symbol | object> = string> = `${Q}=${V}`;
export type ParamRestores = "/restores/" | (string & {});
export type Restores = "/restores";
export type Recycled = "/recycled";
export type DirectToServer = never;
export type Redirect = never;
export type KnownRootPaths = "/" | "/restores" | "/recycled";

export type SignInBody = UserCredentialBody & { rememberMe: boolean };
export type SignUpBody = SignInBody & UserFullName;
export type TodoBody = Pick<Todo, "title" | "details" | "dueDate"> & Partial<Pick<Todo, "status">>;
export type NoteBody = Pick<Note, "title" | "details">;
export type UserCredentialBody = Pick<User, "email"> & { password: string };
export type TransactionBody = Pick<Transaction, "type" | "title" | "amount"> & Partial<Pick<Transaction, "details">>;
export type ScheduleBody = Pick<Schedule, "title" | "details"> & Partial<Pick<Schedule, "start" | "end">>;
export type LinkBody = Pick<Link, "link" | "title"> & Partial<Pick<Link, "position">>;

export type RefreshConfig = "income" | "outcome" | "total";
export type UserFullName = Pick<User, "fullName">;
export type Ids = { ids: string[] };

export type SendOtpType = "CHANGE_EMAIL" | "CHANGE_PASSWORD" | "DELETE_ACCOUNT";

export type GetTemplate<E extends "root" | "param", T> = {
  path: E extends "root" ? Root : Param;
  query: E extends "root" ? Partial<{ query: string; offset: number }> & Record<string, any> : never;
  body: never;
  response: E extends "root" ? T[] : T;
};
export type DeleteTemplate<E extends "root" | "param", T> = {
  path: E extends "root" ? Root : Param;
  query: never;
  body: E extends "root" ? Ids : never;
  response: E extends "root" ? T[] : T;
};
export type RestoresTemplate<E extends "root" | "param", T> = {
  path: E extends "root" ? Restores : ParamRestores;
  query: never;
  body: E extends "root" ? Ids : never;
  response: E extends "root" ? T[] : T;
};
export type RecycledTemplate<T> = {
  path: Recycled;
  query: Partial<{ query: string; offset: number }> & Record<string, any>;
  body: never;
  response: T[];
};
export type RootTemplate<B, T> = {
  path: Root;
  query: never;
  body: B;
  response: T;
};
export type ParamTemplate<B, T> = {
  path: Param;
  query: never;
  body: B;
  response: T;
};

export type AuthEndpoints = {
  get:
    | { path: "/google"; query: never; body: never; response: DirectToServer }
    | { path: "/send-email-verif"; query: never; body: never; response: User }
    | { path: "/google-bind"; query: never; body: never; response: DirectToServer };
  post:
    | { path: "/signup"; query: never; body: SignUpBody; response: User }
    | { path: "/signin"; query: never; body: SignInBody; response: User }
    | { path: "/signout"; query: never; body: never; response: Redirect }
    | { path: "/verify-email"; query: never; body: never; response: User }
    | { path: "/send-otp"; query: Partial<{ type: SendOtpType }> & Record<string, any>; body: never; response: User }
    | { path: "/request-role"; query: Partial<{ role: UserRole }> & Record<string, any>; body: never; response: User };
  put:
    | { path: "/bind-local"; query: never; body: UserCredentialBody; response: User }
    | { path: "/update-email"; query: never; body: { newEmail: string }; response: User }
    | { path: "/reset-password"; query: Partial<{ token: string }> & Record<string, any>; body: { newPassword: string }; response: User }
    | { path: "/update-password"; query: never; body: { newPassword: string; oldPassword: string }; response: User }
    | { path: "/accept-request-role"; query: Partial<{ token: string }> & Record<string, any>; body: never; response: User };
  delete: never;
  patch: never;
};

export type UserEndpoints = {
  get: { path: Root; query: never; body: never; response: User };
  delete: { path: Root; query: Partial<{ token: string }> & Record<string, any>; body: never; response: User };
  put: { path: Root; query: never; body: UserFullName; response: User };
  patch: never;
  post: never;
};

export type TodoEndpoints = {
  get: GetTemplate<"root", Todo> | GetTemplate<"param", Todo> | RecycledTemplate<Todo>;
  post: RootTemplate<TodoBody, Todo> | RootTemplate<TodoBody[], Todo[]>;
  put: RootTemplate<TodoBody[], Todo[]> | ParamTemplate<TodoBody, Todo>;
  delete: DeleteTemplate<"root", Todo> | DeleteTemplate<"param", Todo>;
  patch: RestoresTemplate<"root", Todo> | RestoresTemplate<"param", Todo>;
};

export type NoteEndpoints = {
  get: GetTemplate<"root", Note> | GetTemplate<"param", Note> | RecycledTemplate<Note>;
  post: RootTemplate<NoteBody, Note> | RootTemplate<NoteBody[], Note[]>;
  put: RootTemplate<NoteBody[], Note[]> | ParamTemplate<NoteBody, Note>;
  delete: DeleteTemplate<"root", Note> | DeleteTemplate<"param", Note>;
  patch: RestoresTemplate<"root", Note> | RestoresTemplate<"param", Note>;
};

export type TransactionEndpoints = {
  get: GetTemplate<"root", Transaction> | GetTemplate<"param", Transaction>;
  post: RootTemplate<TransactionBody, Transaction> | RootTemplate<TransactionBody[], Transaction[]>;
  put: RootTemplate<TransactionBody, Transaction>;
  delete: DeleteTemplate<"root", Transaction> | DeleteTemplate<"param", Transaction>;
  patch: RestoresTemplate<"root", Transaction> | RestoresTemplate<"param", Transaction>;
};

export type ScheduleEndpoints = {
  get: GetTemplate<"root", Schedule> | GetTemplate<"param", Schedule> | RecycledTemplate<Schedule>;
  post: RootTemplate<ScheduleBody, Schedule> | RootTemplate<ScheduleBody[], Schedule[]>;
  put: ParamTemplate<ScheduleBody, Schedule> | RootTemplate<ScheduleBody[], Schedule[]>;
  delete: DeleteTemplate<"root", Schedule> | DeleteTemplate<"param", Schedule>;
  patch: RestoresTemplate<"root", Schedule> | RestoresTemplate<"param", Schedule>;
};

export type LinkEndpoints = {
  get: GetTemplate<"root", Link> | GetTemplate<"param", Link>;
  post: RootTemplate<LinkBody, Link> | RootTemplate<LinkBody[], Link[]>;
  put: ParamTemplate<LinkBody, Link> | RootTemplate<LinkBody[], Link[]>;
  delete: DeleteTemplate<"root", Link> | DeleteTemplate<"param", Link>;
  patch: never;
};

export type MoneyEndpoints = {
  get: RootTemplate<never, Money>;
  put: ParamTemplate<never, Money>;
  patch: { path: "/refresh/" | (string & {}); query: Partial<{ refresh: RefreshConfig }> & Record<string, any>; body: never; response: Money };
  post: never;
  delete: never;
};

export type SearchEndpoints = {
  get: { path: "/"; query: never; body: never; response: never };
  put: never;
  patch: never;
  post: never;
  delete: never;
};

export type Endpoints =
  | AuthEndpoints
  | UserEndpoints
  | TodoEndpoints
  | TransactionEndpoints
  | ScheduleEndpoints
  | LinkEndpoints
  | MoneyEndpoints
  | NoteEndpoints
  | SearchEndpoints;

// Helper to check if a type is exactly a literal (not a union with string & {})
type IsExactLiteral<T> = string extends T ? false : true;

export type EndpointOf<P extends Endpoints[keyof Endpoints], M extends P["path"] = P["path"]> = P extends any
  ? P extends { path: infer Path }
    ? IsExactLiteral<M> extends true
      ? // If M is a known root path, only match exact literals
        M extends KnownRootPaths
        ? IsExactLiteral<Path> extends true
          ? M extends Path
            ? Path extends M
              ? P
              : never
            : never
          : never
        : // If M is a literal but not a known root, match against Param types
        M extends Path
        ? P
        : never
      : // If M is not exact literal, do normal matching
      M extends Path
      ? P
      : never
    : never
  : never;

export type BodyOf<P extends Endpoints[keyof Endpoints], M extends P["path"]> = EndpointOf<P, M>["body"];
export type ResponseOf<P extends Endpoints[keyof Endpoints], M extends P["path"]> = EndpointOf<P, M>["response"];
export type QueryOf<P extends Endpoints[keyof Endpoints], M extends P["path"]> = EndpointOf<P, M>["query"];
