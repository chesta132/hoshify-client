import type { Link, Money, Note, Schedule, Todo, Transaction, User, UserRole } from "../models";

export type Root = "/";
export type Param = `/${string}${string}`;
export type ParamRestores = `/restores/${string}${string}`;
export type Restores = "/restores";
export type WithQuery = `/${string}?${string}`;
export type DirectToServer = never;
export type Redirect = never;

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
  path: E extends "root" ? Root | WithQuery : Param;
  body: never;
  response: E extends "root" ? T[] : T;
};
export type DeleteTemplate<E extends "root" | "param", T> = {
  path: E extends "root" ? Root | WithQuery : Param;
  body: E extends "root" ? Ids : never;
  response: E extends "root" ? T[] : T;
};
export type RestoresTemplate<E extends "root" | "param", T> = {
  path: E extends "root" ? Restores : ParamRestores;
  body: E extends "root" ? Ids : never;
  response: E extends "root" ? T[] : T;
};
export type RootTemplate<B, T> = {
  path: Root;
  body: B;
  response: T;
};
export type ParamTemplate<B, T> = {
  path: Param;
  body: B;
  response: T;
};

export type AuthEndpoints = {
  get:
    | { path: "/google"; body: never; response: DirectToServer }
    | { path: "/send-email-verif"; body: never; response: User }
    | { path: "/google-bind"; body: never; response: DirectToServer };
  post:
    | { path: "/signup"; body: SignUpBody; response: User }
    | { path: "/signin"; body: SignInBody; response: User }
    | { path: "/signout"; body: never; response: Redirect }
    | { path: "/verify-email"; body: never; response: User }
    | { path: `/send-otp?type=${SendOtpType}`; body: never; response: User }
    | { path: `/request-role?role=${UserRole}`; body: never; response: User };
  put:
    | { path: "/bind-local"; body: UserCredentialBody; response: User }
    | { path: "/update-email"; body: { newEmail: string }; response: User }
    | { path: `/reset-password?token=${string}${string}`; body: { newPassword: string }; response: User }
    | { path: "/update-password"; body: { newPassword: string; oldPassword: string }; response: User }
    | { path: `/accept-request-role?token=${string}${string}`; body: never; response: User };
  delete: never;
  patch: never;
};

export type UserEndpoints = {
  get: { path: Root; body: never; response: User };
  delete: { path: `${Root}?token=${string}${string}`; body: never; response: User };
  put: { path: Root; body: UserFullName; response: User };
  patch: never;
  post: never;
};

export type TodoEndpoints = {
  get: GetTemplate<"root", Todo> | GetTemplate<"param", Todo>;
  post: RootTemplate<TodoBody, Todo> | RootTemplate<TodoBody[], Todo[]>;
  put: RootTemplate<TodoBody[], Todo[]> | ParamTemplate<TodoBody, Todo>;
  delete: DeleteTemplate<"root", Todo> | DeleteTemplate<"param", Todo>;
  patch: RestoresTemplate<"root", Todo> | RestoresTemplate<"param", Todo>;
};

export type NoteEndpoints = {
  get: GetTemplate<"root", Note> | GetTemplate<"param", Note>;
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
  get: GetTemplate<"root", Schedule> | GetTemplate<"param", Schedule>;
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
  patch: { path: `/refresh${Param}?refresh=${RefreshConfig}`; body: never; response: Money };
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
  | NoteEndpoints;

export type EndpointOf<P extends Endpoints[keyof Endpoints], M extends P["path"] = P["path"]> = P extends infer E
  ? E extends { path: infer Path }
    ? M extends Path
      ? E
      : never
    : never
  : never;

export type BodyOf<P extends Endpoints[keyof Endpoints], M extends P["path"]> = EndpointOf<P, M>["body"];
export type ResponseOf<P extends Endpoints[keyof Endpoints], M extends P["path"]> = EndpointOf<P, M>["response"];
