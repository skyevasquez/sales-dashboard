/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appRoles from "../appRoles.js";
import type * as crons from "../crons.js";
import type * as dailySales from "../dailySales.js";
import type * as http from "../http.js";
import type * as kpis from "../kpis.js";
import type * as lib_auth from "../lib/auth.js";
import type * as monthlyRollups from "../monthlyRollups.js";
import type * as orgMembers from "../orgMembers.js";
import type * as organizations from "../organizations.js";
import type * as reports from "../reports.js";
import type * as stores from "../stores.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appRoles: typeof appRoles;
  crons: typeof crons;
  dailySales: typeof dailySales;
  http: typeof http;
  kpis: typeof kpis;
  "lib/auth": typeof lib_auth;
  monthlyRollups: typeof monthlyRollups;
  orgMembers: typeof orgMembers;
  organizations: typeof organizations;
  reports: typeof reports;
  stores: typeof stores;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
