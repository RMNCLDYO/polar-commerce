/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth_auth from "../auth/auth.js";
import type * as auth_sync from "../auth/sync.js";
import type * as cart_cart from "../cart/cart.js";
import type * as cart_cleanup from "../cart/cleanup.js";
import type * as catalog_catalog from "../catalog/catalog.js";
import type * as catalog_cleanup from "../catalog/cleanup.js";
import type * as catalog_sync from "../catalog/sync.js";
import type * as checkout_checkout from "../checkout/checkout.js";
import type * as checkout_http from "../checkout/http.js";
import type * as checkout_types from "../checkout/types.js";
import type * as demos_demoTodos from "../demos/demoTodos.js";
import type * as emails_components_BaseEmail from "../emails/components/BaseEmail.js";
import type * as emails_email from "../emails/email.js";
import type * as emails_magicLink from "../emails/magicLink.js";
import type * as emails_resetPassword from "../emails/resetPassword.js";
import type * as emails_verifyEmail from "../emails/verifyEmail.js";
import type * as emails_verifyOTP from "../emails/verifyOTP.js";
import type * as examples_advancedPatterns from "../examples/advancedPatterns.js";
import type * as http from "../http.js";
import type * as lib_audit from "../lib/audit.js";
import type * as lib_crud from "../lib/crud.js";
import type * as lib_metrics from "../lib/metrics.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_relationships from "../lib/relationships.js";
import type * as lib_retries from "../lib/retries.js";
import type * as lib_rls from "../lib/rls.js";
import type * as lib_rlsWrappers from "../lib/rlsWrappers.js";
import type * as lib_zodMiddleware from "../lib/zodMiddleware.js";
import type * as model_cart from "../model/cart.js";
import type * as model_catalog from "../model/catalog.js";
import type * as model_checkout from "../model/checkout.js";
import type * as model_wishlist from "../model/wishlist.js";
import type * as orders_http from "../orders/http.js";
import type * as orders_sync from "../orders/sync.js";
import type * as orders_webhook from "../orders/webhook.js";
import type * as polar__generated_api from "../polar/_generated/api.js";
import type * as polar__generated_server from "../polar/_generated/server.js";
import type * as polar_lib from "../polar/lib.js";
import type * as polar_types from "../polar/types.js";
import type * as polar_util from "../polar/util.js";
import type * as polar from "../polar.js";
import type * as polarCustomer from "../polarCustomer.js";
import type * as polarMiddleware from "../polarMiddleware.js";
import type * as types_convex from "../types/convex.js";
import type * as types_convex_internals from "../types/convex_internals.js";
import type * as types_metadata from "../types/metadata.js";
import type * as utils_clearDatabase from "../utils/clearDatabase.js";
import type * as utils_cors from "../utils/cors.js";
import type * as utils_crons from "../utils/crons.js";
import type * as utils_inspectData from "../utils/inspectData.js";
import type * as utils_logger from "../utils/logger.js";
import type * as utils_validation from "../utils/validation.js";
import type * as wishlist_wishlist from "../wishlist/wishlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "auth/auth": typeof auth_auth;
  "auth/sync": typeof auth_sync;
  "cart/cart": typeof cart_cart;
  "cart/cleanup": typeof cart_cleanup;
  "catalog/catalog": typeof catalog_catalog;
  "catalog/cleanup": typeof catalog_cleanup;
  "catalog/sync": typeof catalog_sync;
  "checkout/checkout": typeof checkout_checkout;
  "checkout/http": typeof checkout_http;
  "checkout/types": typeof checkout_types;
  "demos/demoTodos": typeof demos_demoTodos;
  "emails/components/BaseEmail": typeof emails_components_BaseEmail;
  "emails/email": typeof emails_email;
  "emails/magicLink": typeof emails_magicLink;
  "emails/resetPassword": typeof emails_resetPassword;
  "emails/verifyEmail": typeof emails_verifyEmail;
  "emails/verifyOTP": typeof emails_verifyOTP;
  "examples/advancedPatterns": typeof examples_advancedPatterns;
  http: typeof http;
  "lib/audit": typeof lib_audit;
  "lib/crud": typeof lib_crud;
  "lib/metrics": typeof lib_metrics;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/relationships": typeof lib_relationships;
  "lib/retries": typeof lib_retries;
  "lib/rls": typeof lib_rls;
  "lib/rlsWrappers": typeof lib_rlsWrappers;
  "lib/zodMiddleware": typeof lib_zodMiddleware;
  "model/cart": typeof model_cart;
  "model/catalog": typeof model_catalog;
  "model/checkout": typeof model_checkout;
  "model/wishlist": typeof model_wishlist;
  "orders/http": typeof orders_http;
  "orders/sync": typeof orders_sync;
  "orders/webhook": typeof orders_webhook;
  "polar/_generated/api": typeof polar__generated_api;
  "polar/_generated/server": typeof polar__generated_server;
  "polar/lib": typeof polar_lib;
  "polar/types": typeof polar_types;
  "polar/util": typeof polar_util;
  polar: typeof polar;
  polarCustomer: typeof polarCustomer;
  polarMiddleware: typeof polarMiddleware;
  "types/convex": typeof types_convex;
  "types/convex_internals": typeof types_convex_internals;
  "types/metadata": typeof types_metadata;
  "utils/clearDatabase": typeof utils_clearDatabase;
  "utils/cors": typeof utils_cors;
  "utils/crons": typeof utils_crons;
  "utils/inspectData": typeof utils_inspectData;
  "utils/logger": typeof utils_logger;
  "utils/validation": typeof utils_validation;
  "wishlist/wishlist": typeof wishlist_wishlist;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: {
    adapter: {
      create: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                data: {
                  createdAt: number;
                  displayUsername?: null | string;
                  email: string;
                  emailVerified: boolean;
                  image?: null | string;
                  isAnonymous?: null | boolean;
                  name: string;
                  phoneNumber?: null | string;
                  phoneNumberVerified?: null | boolean;
                  twoFactorEnabled?: null | boolean;
                  updatedAt: number;
                  userId?: null | string;
                  username?: null | string;
                };
                model: "user";
              }
            | {
                data: {
                  createdAt: number;
                  expiresAt: number;
                  ipAddress?: null | string;
                  token: string;
                  updatedAt: number;
                  userAgent?: null | string;
                  userId: string;
                };
                model: "session";
              }
            | {
                data: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId: string;
                  createdAt: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt: number;
                  userId: string;
                };
                model: "account";
              }
            | {
                data: {
                  createdAt: number;
                  expiresAt: number;
                  identifier: string;
                  updatedAt: number;
                  value: string;
                };
                model: "verification";
              }
            | {
                data: { backupCodes: string; secret: string; userId: string };
                model: "twoFactor";
              }
            | {
                data: {
                  aaguid?: null | string;
                  backedUp: boolean;
                  counter: number;
                  createdAt?: null | number;
                  credentialID: string;
                  deviceType: string;
                  name?: null | string;
                  publicKey: string;
                  transports?: null | string;
                  userId: string;
                };
                model: "passkey";
              }
            | {
                data: {
                  clientId?: null | string;
                  clientSecret?: null | string;
                  createdAt?: null | number;
                  disabled?: null | boolean;
                  icon?: null | string;
                  metadata?: null | string;
                  name?: null | string;
                  redirectURLs?: null | string;
                  type?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                model: "oauthApplication";
              }
            | {
                data: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  clientId?: null | string;
                  createdAt?: null | number;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                model: "oauthAccessToken";
              }
            | {
                data: {
                  clientId?: null | string;
                  consentGiven?: null | boolean;
                  createdAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                model: "oauthConsent";
              }
            | {
                data: {
                  createdAt: number;
                  privateKey: string;
                  publicKey: string;
                };
                model: "jwks";
              }
            | {
                data: {
                  count?: null | number;
                  key?: null | string;
                  lastRequest?: null | number;
                };
                model: "rateLimit";
              }
            | {
                data: { count: number; key: string; lastRequest: number };
                model: "ratelimit";
              };
          onCreateHandle?: string;
          select?: Array<string>;
        },
        any
      >;
      deleteMany: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "passkey";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "publicKey"
                    | "userId"
                    | "credentialID"
                    | "counter"
                    | "deviceType"
                    | "backedUp"
                    | "transports"
                    | "createdAt"
                    | "aaguid"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectURLs"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "publicKey" | "privateKey" | "createdAt" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "ratelimit";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onDeleteHandle?: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      deleteOne: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "passkey";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "publicKey"
                    | "userId"
                    | "credentialID"
                    | "counter"
                    | "deviceType"
                    | "backedUp"
                    | "transports"
                    | "createdAt"
                    | "aaguid"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectURLs"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "publicKey" | "privateKey" | "createdAt" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "ratelimit";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onDeleteHandle?: string;
        },
        any
      >;
      findMany: FunctionReference<
        "query",
        "internal",
        {
          limit?: number;
          model:
            | "user"
            | "session"
            | "account"
            | "verification"
            | "twoFactor"
            | "passkey"
            | "oauthApplication"
            | "oauthAccessToken"
            | "oauthConsent"
            | "jwks"
            | "rateLimit"
            | "ratelimit";
          offset?: number;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          sortBy?: { direction: "asc" | "desc"; field: string };
          where?: Array<{
            connector?: "AND" | "OR";
            field: string;
            operator?:
              | "lt"
              | "lte"
              | "gt"
              | "gte"
              | "eq"
              | "in"
              | "not_in"
              | "ne"
              | "contains"
              | "starts_with"
              | "ends_with";
            value:
              | string
              | number
              | boolean
              | Array<string>
              | Array<number>
              | null;
          }>;
        },
        any
      >;
      findOne: FunctionReference<
        "query",
        "internal",
        {
          model:
            | "user"
            | "session"
            | "account"
            | "verification"
            | "twoFactor"
            | "passkey"
            | "oauthApplication"
            | "oauthAccessToken"
            | "oauthConsent"
            | "jwks"
            | "rateLimit"
            | "ratelimit";
          select?: Array<string>;
          where?: Array<{
            connector?: "AND" | "OR";
            field: string;
            operator?:
              | "lt"
              | "lte"
              | "gt"
              | "gte"
              | "eq"
              | "in"
              | "not_in"
              | "ne"
              | "contains"
              | "starts_with"
              | "ends_with";
            value:
              | string
              | number
              | boolean
              | Array<string>
              | Array<number>
              | null;
          }>;
        },
        any
      >;
      migrationRemoveUserId: FunctionReference<
        "mutation",
        "internal",
        { userId: string },
        any
      >;
      updateMany: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                update: {
                  createdAt?: number;
                  displayUsername?: null | string;
                  email?: string;
                  emailVerified?: boolean;
                  image?: null | string;
                  isAnonymous?: null | boolean;
                  name?: string;
                  phoneNumber?: null | string;
                  phoneNumberVerified?: null | boolean;
                  twoFactorEnabled?: null | boolean;
                  updatedAt?: number;
                  userId?: null | string;
                  username?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  ipAddress?: null | string;
                  token?: string;
                  updatedAt?: number;
                  userAgent?: null | string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId?: string;
                  createdAt?: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId?: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  identifier?: string;
                  updatedAt?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                update: {
                  backupCodes?: string;
                  secret?: string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "passkey";
                update: {
                  aaguid?: null | string;
                  backedUp?: boolean;
                  counter?: number;
                  createdAt?: null | number;
                  credentialID?: string;
                  deviceType?: string;
                  name?: null | string;
                  publicKey?: string;
                  transports?: null | string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "publicKey"
                    | "userId"
                    | "credentialID"
                    | "counter"
                    | "deviceType"
                    | "backedUp"
                    | "transports"
                    | "createdAt"
                    | "aaguid"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                update: {
                  clientId?: null | string;
                  clientSecret?: null | string;
                  createdAt?: null | number;
                  disabled?: null | boolean;
                  icon?: null | string;
                  metadata?: null | string;
                  name?: null | string;
                  redirectURLs?: null | string;
                  type?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectURLs"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  clientId?: null | string;
                  createdAt?: null | number;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                update: {
                  clientId?: null | string;
                  consentGiven?: null | boolean;
                  createdAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                update: {
                  createdAt?: number;
                  privateKey?: string;
                  publicKey?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "publicKey" | "privateKey" | "createdAt" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                update: {
                  count?: null | number;
                  key?: null | string;
                  lastRequest?: null | number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "ratelimit";
                update: { count?: number; key?: string; lastRequest?: number };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onUpdateHandle?: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      updateOne: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                update: {
                  createdAt?: number;
                  displayUsername?: null | string;
                  email?: string;
                  emailVerified?: boolean;
                  image?: null | string;
                  isAnonymous?: null | boolean;
                  name?: string;
                  phoneNumber?: null | string;
                  phoneNumberVerified?: null | boolean;
                  twoFactorEnabled?: null | boolean;
                  updatedAt?: number;
                  userId?: null | string;
                  username?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  ipAddress?: null | string;
                  token?: string;
                  updatedAt?: number;
                  userAgent?: null | string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId?: string;
                  createdAt?: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId?: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  identifier?: string;
                  updatedAt?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                update: {
                  backupCodes?: string;
                  secret?: string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "passkey";
                update: {
                  aaguid?: null | string;
                  backedUp?: boolean;
                  counter?: number;
                  createdAt?: null | number;
                  credentialID?: string;
                  deviceType?: string;
                  name?: null | string;
                  publicKey?: string;
                  transports?: null | string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "publicKey"
                    | "userId"
                    | "credentialID"
                    | "counter"
                    | "deviceType"
                    | "backedUp"
                    | "transports"
                    | "createdAt"
                    | "aaguid"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                update: {
                  clientId?: null | string;
                  clientSecret?: null | string;
                  createdAt?: null | number;
                  disabled?: null | boolean;
                  icon?: null | string;
                  metadata?: null | string;
                  name?: null | string;
                  redirectURLs?: null | string;
                  type?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectURLs"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  clientId?: null | string;
                  createdAt?: null | number;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                update: {
                  clientId?: null | string;
                  consentGiven?: null | boolean;
                  createdAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                update: {
                  createdAt?: number;
                  privateKey?: string;
                  publicKey?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "publicKey" | "privateKey" | "createdAt" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                update: {
                  count?: null | number;
                  key?: null | string;
                  lastRequest?: null | number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "ratelimit";
                update: { count?: number; key?: string; lastRequest?: number };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onUpdateHandle?: string;
        },
        any
      >;
    };
    adapterTest: {
      count: FunctionReference<"query", "internal", any, any>;
      create: FunctionReference<"mutation", "internal", any, any>;
      delete: FunctionReference<"mutation", "internal", any, any>;
      deleteMany: FunctionReference<"mutation", "internal", any, any>;
      findMany: FunctionReference<"query", "internal", any, any>;
      findOne: FunctionReference<"query", "internal", any, any>;
      update: FunctionReference<"mutation", "internal", any, any>;
      updateMany: FunctionReference<"mutation", "internal", any, any>;
    };
  };
  resend: {
    lib: {
      cancelEmail: FunctionReference<
        "mutation",
        "internal",
        { emailId: string },
        null
      >;
      cleanupAbandonedEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      cleanupOldEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      createManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          replyTo?: Array<string>;
          subject: string;
          to: string;
        },
        string
      >;
      get: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          complained: boolean;
          createdAt: number;
          errorMessage?: string;
          finalizedAt: number;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          opened: boolean;
          replyTo: Array<string>;
          resendId?: string;
          segment: number;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
          subject: string;
          text?: string;
          to: string;
        } | null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          complained: boolean;
          errorMessage: string | null;
          opened: boolean;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        } | null
      >;
      handleEmailEvent: FunctionReference<
        "mutation",
        "internal",
        { event: any },
        null
      >;
      sendEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          options: {
            apiKey: string;
            initialBackoffMs: number;
            onEmailEvent?: { fnHandle: string };
            retryAttempts: number;
            testMode: boolean;
          };
          replyTo?: Array<string>;
          subject: string;
          text?: string;
          to: string;
        },
        string
      >;
      updateManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          emailId: string;
          errorMessage?: string;
          resendId?: string;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        },
        null
      >;
    };
  };
  polar: {
    lib: {
      createProduct: FunctionReference<
        "mutation",
        "internal",
        {
          product: {
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              createdAt: string;
              id: string;
              isArchived: boolean;
              modifiedAt: string | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: "month" | "year" | null;
              type?: string;
            }>;
            recurringInterval?: "month" | "year" | null;
          };
        },
        any
      >;
      createSubscription: FunctionReference<
        "mutation",
        "internal",
        {
          subscription: {
            amount: number | null;
            cancelAtPeriodEnd: boolean;
            checkoutId: string | null;
            createdAt: string;
            currency: string | null;
            currentPeriodEnd: string | null;
            currentPeriodStart: string;
            customerCancellationComment?: string | null;
            customerCancellationReason?: string | null;
            customerId: string;
            endedAt: string | null;
            id: string;
            metadata: Record<string, any>;
            modifiedAt: string | null;
            priceId?: string;
            productId: string;
            recurringInterval: "month" | "year" | null;
            startedAt: string | null;
            status: string;
          };
        },
        any
      >;
      deleteCustomer: FunctionReference<
        "mutation",
        "internal",
        { userId: string },
        any
      >;
      deleteProduct: FunctionReference<
        "mutation",
        "internal",
        { id: string },
        any
      >;
      deleteSubscription: FunctionReference<
        "mutation",
        "internal",
        { id: string },
        any
      >;
      getCurrentSubscription: FunctionReference<
        "query",
        "internal",
        { userId: string },
        {
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          checkoutId: string | null;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          endedAt: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          product: {
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              createdAt: string;
              id: string;
              isArchived: boolean;
              modifiedAt: string | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: "month" | "year" | null;
              type?: string;
            }>;
            recurringInterval?: "month" | "year" | null;
          };
          productId: string;
          recurringInterval: "month" | "year" | null;
          startedAt: string | null;
          status: string;
        } | null
      >;
      getCustomerByUserId: FunctionReference<
        "query",
        "internal",
        { userId: string },
        {
          avatar_url?: string | null;
          billing_address?: {
            city: string | null;
            country:
              | "AD"
              | "AE"
              | "AF"
              | "AG"
              | "AI"
              | "AL"
              | "AM"
              | "AO"
              | "AQ"
              | "AR"
              | "AS"
              | "AT"
              | "AU"
              | "AW"
              | "AX"
              | "AZ"
              | "BA"
              | "BB"
              | "BD"
              | "BE"
              | "BF"
              | "BG"
              | "BH"
              | "BI"
              | "BJ"
              | "BL"
              | "BM"
              | "BN"
              | "BO"
              | "BQ"
              | "BR"
              | "BS"
              | "BT"
              | "BV"
              | "BW"
              | "BY"
              | "BZ"
              | "CA"
              | "CC"
              | "CD"
              | "CF"
              | "CG"
              | "CH"
              | "CI"
              | "CK"
              | "CL"
              | "CM"
              | "CN"
              | "CO"
              | "CR"
              | "CU"
              | "CV"
              | "CW"
              | "CX"
              | "CY"
              | "CZ"
              | "DE"
              | "DJ"
              | "DK"
              | "DM"
              | "DO"
              | "DZ"
              | "EC"
              | "EE"
              | "EG"
              | "EH"
              | "ER"
              | "ES"
              | "ET"
              | "FI"
              | "FJ"
              | "FK"
              | "FM"
              | "FO"
              | "FR"
              | "GA"
              | "GB"
              | "GD"
              | "GE"
              | "GF"
              | "GG"
              | "GH"
              | "GI"
              | "GL"
              | "GM"
              | "GN"
              | "GP"
              | "GQ"
              | "GR"
              | "GS"
              | "GT"
              | "GU"
              | "GW"
              | "GY"
              | "HK"
              | "HM"
              | "HN"
              | "HR"
              | "HT"
              | "HU"
              | "ID"
              | "IE"
              | "IL"
              | "IM"
              | "IN"
              | "IO"
              | "IQ"
              | "IR"
              | "IS"
              | "IT"
              | "JE"
              | "JM"
              | "JO"
              | "JP"
              | "KE"
              | "KG"
              | "KH"
              | "KI"
              | "KM"
              | "KN"
              | "KP"
              | "KR"
              | "KW"
              | "KY"
              | "KZ"
              | "LA"
              | "LB"
              | "LC"
              | "LI"
              | "LK"
              | "LR"
              | "LS"
              | "LT"
              | "LU"
              | "LV"
              | "LY"
              | "MA"
              | "MC"
              | "MD"
              | "ME"
              | "MF"
              | "MG"
              | "MH"
              | "MK"
              | "ML"
              | "MM"
              | "MN"
              | "MO"
              | "MP"
              | "MQ"
              | "MR"
              | "MS"
              | "MT"
              | "MU"
              | "MV"
              | "MW"
              | "MX"
              | "MY"
              | "MZ"
              | "NA"
              | "NC"
              | "NE"
              | "NF"
              | "NG"
              | "NI"
              | "NL"
              | "NO"
              | "NP"
              | "NR"
              | "NU"
              | "NZ"
              | "OM"
              | "PA"
              | "PE"
              | "PF"
              | "PG"
              | "PH"
              | "PK"
              | "PL"
              | "PM"
              | "PN"
              | "PR"
              | "PS"
              | "PT"
              | "PW"
              | "PY"
              | "QA"
              | "RE"
              | "RO"
              | "RS"
              | "RU"
              | "RW"
              | "SA"
              | "SB"
              | "SC"
              | "SD"
              | "SE"
              | "SG"
              | "SH"
              | "SI"
              | "SJ"
              | "SK"
              | "SL"
              | "SM"
              | "SN"
              | "SO"
              | "SR"
              | "SS"
              | "ST"
              | "SV"
              | "SX"
              | "SY"
              | "SZ"
              | "TC"
              | "TD"
              | "TF"
              | "TG"
              | "TH"
              | "TJ"
              | "TK"
              | "TL"
              | "TM"
              | "TN"
              | "TO"
              | "TR"
              | "TT"
              | "TV"
              | "TW"
              | "TZ"
              | "UA"
              | "UG"
              | "UM"
              | "US"
              | "UY"
              | "UZ"
              | "VA"
              | "VC"
              | "VE"
              | "VG"
              | "VI"
              | "VN"
              | "VU"
              | "WF"
              | "WS"
              | "YE"
              | "YT"
              | "ZA"
              | "ZM"
              | "ZW";
            line1: string | null;
            line2: string | null;
            postal_code: string | null;
            state: string | null;
          } | null;
          created_at?: string;
          deleted_at?: string | null;
          email?: string;
          email_verified?: boolean;
          external_id?: string | null;
          id: string;
          metadata?: Record<string, string | number | boolean>;
          modified_at?: string | null;
          name?: string | null;
          tax_id?: Array<
            | string
            | "ad_nrt"
            | "ae_trn"
            | "ar_cuit"
            | "au_abn"
            | "au_arn"
            | "bg_uic"
            | "bh_vat"
            | "bo_tin"
            | "br_cnpj"
            | "br_cpf"
            | "ca_bn"
            | "ca_gst_hst"
            | "ca_pst_bc"
            | "ca_pst_mb"
            | "ca_pst_sk"
            | "ca_qst"
            | "ch_uid"
            | "ch_vat"
            | "cl_tin"
            | "cn_tin"
            | "co_nit"
            | "cr_tin"
            | "de_stn"
            | "do_rcn"
            | "ec_ruc"
            | "eg_tin"
            | "es_cif"
            | "eu_oss_vat"
            | "eu_vat"
            | "gb_vat"
            | "ge_vat"
            | "hk_br"
            | "hr_oib"
            | "hu_tin"
            | "id_npwp"
            | "il_vat"
            | "in_gst"
            | "is_vat"
            | "jp_cn"
            | "jp_rn"
            | "jp_trn"
            | "ke_pin"
            | "kr_brn"
            | "kz_bin"
            | "li_uid"
            | "mx_rfc"
            | "my_frp"
            | "my_itn"
            | "my_sst"
            | "ng_tin"
            | "no_vat"
            | "no_voec"
            | "nz_gst"
            | "om_vat"
            | "pe_ruc"
            | "ph_tin"
            | "ro_tin"
            | "rs_pib"
            | "ru_inn"
            | "ru_kpp"
            | "sa_vat"
            | "sg_gst"
            | "sg_uen"
            | "si_tin"
            | "sv_nit"
            | "th_vat"
            | "tr_tin"
            | "tw_vat"
            | "ua_vat"
            | "us_ein"
            | "uy_ruc"
            | "ve_rif"
            | "vn_tin"
            | "za_vat"
          > | null;
          userId: string;
        } | null
      >;
      getProduct: FunctionReference<
        "query",
        "internal",
        { id: string },
        {
          createdAt: string;
          description: string | null;
          id: string;
          isArchived: boolean;
          isRecurring: boolean;
          medias: Array<{
            checksumEtag: string | null;
            checksumSha256Base64: string | null;
            checksumSha256Hex: string | null;
            createdAt: string;
            id: string;
            isUploaded: boolean;
            lastModifiedAt: string | null;
            mimeType: string;
            name: string;
            organizationId: string;
            path: string;
            publicUrl: string;
            service?: string;
            size: number;
            sizeReadable: string;
            storageVersion: string | null;
            version: string | null;
          }>;
          metadata?: Record<string, any>;
          modifiedAt: string | null;
          name: string;
          organizationId: string;
          prices: Array<{
            amountType?: string;
            createdAt: string;
            id: string;
            isArchived: boolean;
            modifiedAt: string | null;
            priceAmount?: number;
            priceCurrency?: string;
            productId: string;
            recurringInterval?: "month" | "year" | null;
            type?: string;
          }>;
          recurringInterval?: "month" | "year" | null;
        } | null
      >;
      getSubscription: FunctionReference<
        "query",
        "internal",
        { id: string },
        {
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          checkoutId: string | null;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          endedAt: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          productId: string;
          recurringInterval: "month" | "year" | null;
          startedAt: string | null;
          status: string;
        } | null
      >;
      insertCustomer: FunctionReference<
        "mutation",
        "internal",
        {
          avatar_url?: string | null;
          billing_address?: {
            city: string | null;
            country:
              | "AD"
              | "AE"
              | "AF"
              | "AG"
              | "AI"
              | "AL"
              | "AM"
              | "AO"
              | "AQ"
              | "AR"
              | "AS"
              | "AT"
              | "AU"
              | "AW"
              | "AX"
              | "AZ"
              | "BA"
              | "BB"
              | "BD"
              | "BE"
              | "BF"
              | "BG"
              | "BH"
              | "BI"
              | "BJ"
              | "BL"
              | "BM"
              | "BN"
              | "BO"
              | "BQ"
              | "BR"
              | "BS"
              | "BT"
              | "BV"
              | "BW"
              | "BY"
              | "BZ"
              | "CA"
              | "CC"
              | "CD"
              | "CF"
              | "CG"
              | "CH"
              | "CI"
              | "CK"
              | "CL"
              | "CM"
              | "CN"
              | "CO"
              | "CR"
              | "CU"
              | "CV"
              | "CW"
              | "CX"
              | "CY"
              | "CZ"
              | "DE"
              | "DJ"
              | "DK"
              | "DM"
              | "DO"
              | "DZ"
              | "EC"
              | "EE"
              | "EG"
              | "EH"
              | "ER"
              | "ES"
              | "ET"
              | "FI"
              | "FJ"
              | "FK"
              | "FM"
              | "FO"
              | "FR"
              | "GA"
              | "GB"
              | "GD"
              | "GE"
              | "GF"
              | "GG"
              | "GH"
              | "GI"
              | "GL"
              | "GM"
              | "GN"
              | "GP"
              | "GQ"
              | "GR"
              | "GS"
              | "GT"
              | "GU"
              | "GW"
              | "GY"
              | "HK"
              | "HM"
              | "HN"
              | "HR"
              | "HT"
              | "HU"
              | "ID"
              | "IE"
              | "IL"
              | "IM"
              | "IN"
              | "IO"
              | "IQ"
              | "IR"
              | "IS"
              | "IT"
              | "JE"
              | "JM"
              | "JO"
              | "JP"
              | "KE"
              | "KG"
              | "KH"
              | "KI"
              | "KM"
              | "KN"
              | "KP"
              | "KR"
              | "KW"
              | "KY"
              | "KZ"
              | "LA"
              | "LB"
              | "LC"
              | "LI"
              | "LK"
              | "LR"
              | "LS"
              | "LT"
              | "LU"
              | "LV"
              | "LY"
              | "MA"
              | "MC"
              | "MD"
              | "ME"
              | "MF"
              | "MG"
              | "MH"
              | "MK"
              | "ML"
              | "MM"
              | "MN"
              | "MO"
              | "MP"
              | "MQ"
              | "MR"
              | "MS"
              | "MT"
              | "MU"
              | "MV"
              | "MW"
              | "MX"
              | "MY"
              | "MZ"
              | "NA"
              | "NC"
              | "NE"
              | "NF"
              | "NG"
              | "NI"
              | "NL"
              | "NO"
              | "NP"
              | "NR"
              | "NU"
              | "NZ"
              | "OM"
              | "PA"
              | "PE"
              | "PF"
              | "PG"
              | "PH"
              | "PK"
              | "PL"
              | "PM"
              | "PN"
              | "PR"
              | "PS"
              | "PT"
              | "PW"
              | "PY"
              | "QA"
              | "RE"
              | "RO"
              | "RS"
              | "RU"
              | "RW"
              | "SA"
              | "SB"
              | "SC"
              | "SD"
              | "SE"
              | "SG"
              | "SH"
              | "SI"
              | "SJ"
              | "SK"
              | "SL"
              | "SM"
              | "SN"
              | "SO"
              | "SR"
              | "SS"
              | "ST"
              | "SV"
              | "SX"
              | "SY"
              | "SZ"
              | "TC"
              | "TD"
              | "TF"
              | "TG"
              | "TH"
              | "TJ"
              | "TK"
              | "TL"
              | "TM"
              | "TN"
              | "TO"
              | "TR"
              | "TT"
              | "TV"
              | "TW"
              | "TZ"
              | "UA"
              | "UG"
              | "UM"
              | "US"
              | "UY"
              | "UZ"
              | "VA"
              | "VC"
              | "VE"
              | "VG"
              | "VI"
              | "VN"
              | "VU"
              | "WF"
              | "WS"
              | "YE"
              | "YT"
              | "ZA"
              | "ZM"
              | "ZW";
            line1: string | null;
            line2: string | null;
            postal_code: string | null;
            state: string | null;
          } | null;
          created_at?: string;
          deleted_at?: string | null;
          email?: string;
          email_verified?: boolean;
          external_id?: string | null;
          id: string;
          metadata?: Record<string, string | number | boolean>;
          modified_at?: string | null;
          name?: string | null;
          tax_id?: Array<
            | string
            | "ad_nrt"
            | "ae_trn"
            | "ar_cuit"
            | "au_abn"
            | "au_arn"
            | "bg_uic"
            | "bh_vat"
            | "bo_tin"
            | "br_cnpj"
            | "br_cpf"
            | "ca_bn"
            | "ca_gst_hst"
            | "ca_pst_bc"
            | "ca_pst_mb"
            | "ca_pst_sk"
            | "ca_qst"
            | "ch_uid"
            | "ch_vat"
            | "cl_tin"
            | "cn_tin"
            | "co_nit"
            | "cr_tin"
            | "de_stn"
            | "do_rcn"
            | "ec_ruc"
            | "eg_tin"
            | "es_cif"
            | "eu_oss_vat"
            | "eu_vat"
            | "gb_vat"
            | "ge_vat"
            | "hk_br"
            | "hr_oib"
            | "hu_tin"
            | "id_npwp"
            | "il_vat"
            | "in_gst"
            | "is_vat"
            | "jp_cn"
            | "jp_rn"
            | "jp_trn"
            | "ke_pin"
            | "kr_brn"
            | "kz_bin"
            | "li_uid"
            | "mx_rfc"
            | "my_frp"
            | "my_itn"
            | "my_sst"
            | "ng_tin"
            | "no_vat"
            | "no_voec"
            | "nz_gst"
            | "om_vat"
            | "pe_ruc"
            | "ph_tin"
            | "ro_tin"
            | "rs_pib"
            | "ru_inn"
            | "ru_kpp"
            | "sa_vat"
            | "sg_gst"
            | "sg_uen"
            | "si_tin"
            | "sv_nit"
            | "th_vat"
            | "tr_tin"
            | "tw_vat"
            | "ua_vat"
            | "us_ein"
            | "uy_ruc"
            | "ve_rif"
            | "vn_tin"
            | "za_vat"
          > | null;
          userId: string;
        },
        string
      >;
      listCustomerSubscriptions: FunctionReference<
        "query",
        "internal",
        { customerId: string },
        Array<{
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          checkoutId: string | null;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          endedAt: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          productId: string;
          recurringInterval: "month" | "year" | null;
          startedAt: string | null;
          status: string;
        }>
      >;
      listCustomers: FunctionReference<
        "query",
        "internal",
        {},
        Array<{
          avatar_url?: string | null;
          billing_address?: {
            city: string | null;
            country:
              | "AD"
              | "AE"
              | "AF"
              | "AG"
              | "AI"
              | "AL"
              | "AM"
              | "AO"
              | "AQ"
              | "AR"
              | "AS"
              | "AT"
              | "AU"
              | "AW"
              | "AX"
              | "AZ"
              | "BA"
              | "BB"
              | "BD"
              | "BE"
              | "BF"
              | "BG"
              | "BH"
              | "BI"
              | "BJ"
              | "BL"
              | "BM"
              | "BN"
              | "BO"
              | "BQ"
              | "BR"
              | "BS"
              | "BT"
              | "BV"
              | "BW"
              | "BY"
              | "BZ"
              | "CA"
              | "CC"
              | "CD"
              | "CF"
              | "CG"
              | "CH"
              | "CI"
              | "CK"
              | "CL"
              | "CM"
              | "CN"
              | "CO"
              | "CR"
              | "CU"
              | "CV"
              | "CW"
              | "CX"
              | "CY"
              | "CZ"
              | "DE"
              | "DJ"
              | "DK"
              | "DM"
              | "DO"
              | "DZ"
              | "EC"
              | "EE"
              | "EG"
              | "EH"
              | "ER"
              | "ES"
              | "ET"
              | "FI"
              | "FJ"
              | "FK"
              | "FM"
              | "FO"
              | "FR"
              | "GA"
              | "GB"
              | "GD"
              | "GE"
              | "GF"
              | "GG"
              | "GH"
              | "GI"
              | "GL"
              | "GM"
              | "GN"
              | "GP"
              | "GQ"
              | "GR"
              | "GS"
              | "GT"
              | "GU"
              | "GW"
              | "GY"
              | "HK"
              | "HM"
              | "HN"
              | "HR"
              | "HT"
              | "HU"
              | "ID"
              | "IE"
              | "IL"
              | "IM"
              | "IN"
              | "IO"
              | "IQ"
              | "IR"
              | "IS"
              | "IT"
              | "JE"
              | "JM"
              | "JO"
              | "JP"
              | "KE"
              | "KG"
              | "KH"
              | "KI"
              | "KM"
              | "KN"
              | "KP"
              | "KR"
              | "KW"
              | "KY"
              | "KZ"
              | "LA"
              | "LB"
              | "LC"
              | "LI"
              | "LK"
              | "LR"
              | "LS"
              | "LT"
              | "LU"
              | "LV"
              | "LY"
              | "MA"
              | "MC"
              | "MD"
              | "ME"
              | "MF"
              | "MG"
              | "MH"
              | "MK"
              | "ML"
              | "MM"
              | "MN"
              | "MO"
              | "MP"
              | "MQ"
              | "MR"
              | "MS"
              | "MT"
              | "MU"
              | "MV"
              | "MW"
              | "MX"
              | "MY"
              | "MZ"
              | "NA"
              | "NC"
              | "NE"
              | "NF"
              | "NG"
              | "NI"
              | "NL"
              | "NO"
              | "NP"
              | "NR"
              | "NU"
              | "NZ"
              | "OM"
              | "PA"
              | "PE"
              | "PF"
              | "PG"
              | "PH"
              | "PK"
              | "PL"
              | "PM"
              | "PN"
              | "PR"
              | "PS"
              | "PT"
              | "PW"
              | "PY"
              | "QA"
              | "RE"
              | "RO"
              | "RS"
              | "RU"
              | "RW"
              | "SA"
              | "SB"
              | "SC"
              | "SD"
              | "SE"
              | "SG"
              | "SH"
              | "SI"
              | "SJ"
              | "SK"
              | "SL"
              | "SM"
              | "SN"
              | "SO"
              | "SR"
              | "SS"
              | "ST"
              | "SV"
              | "SX"
              | "SY"
              | "SZ"
              | "TC"
              | "TD"
              | "TF"
              | "TG"
              | "TH"
              | "TJ"
              | "TK"
              | "TL"
              | "TM"
              | "TN"
              | "TO"
              | "TR"
              | "TT"
              | "TV"
              | "TW"
              | "TZ"
              | "UA"
              | "UG"
              | "UM"
              | "US"
              | "UY"
              | "UZ"
              | "VA"
              | "VC"
              | "VE"
              | "VG"
              | "VI"
              | "VN"
              | "VU"
              | "WF"
              | "WS"
              | "YE"
              | "YT"
              | "ZA"
              | "ZM"
              | "ZW";
            line1: string | null;
            line2: string | null;
            postal_code: string | null;
            state: string | null;
          } | null;
          created_at?: string;
          deleted_at?: string | null;
          email?: string;
          email_verified?: boolean;
          external_id?: string | null;
          id: string;
          metadata?: Record<string, string | number | boolean>;
          modified_at?: string | null;
          name?: string | null;
          tax_id?: Array<
            | string
            | "ad_nrt"
            | "ae_trn"
            | "ar_cuit"
            | "au_abn"
            | "au_arn"
            | "bg_uic"
            | "bh_vat"
            | "bo_tin"
            | "br_cnpj"
            | "br_cpf"
            | "ca_bn"
            | "ca_gst_hst"
            | "ca_pst_bc"
            | "ca_pst_mb"
            | "ca_pst_sk"
            | "ca_qst"
            | "ch_uid"
            | "ch_vat"
            | "cl_tin"
            | "cn_tin"
            | "co_nit"
            | "cr_tin"
            | "de_stn"
            | "do_rcn"
            | "ec_ruc"
            | "eg_tin"
            | "es_cif"
            | "eu_oss_vat"
            | "eu_vat"
            | "gb_vat"
            | "ge_vat"
            | "hk_br"
            | "hr_oib"
            | "hu_tin"
            | "id_npwp"
            | "il_vat"
            | "in_gst"
            | "is_vat"
            | "jp_cn"
            | "jp_rn"
            | "jp_trn"
            | "ke_pin"
            | "kr_brn"
            | "kz_bin"
            | "li_uid"
            | "mx_rfc"
            | "my_frp"
            | "my_itn"
            | "my_sst"
            | "ng_tin"
            | "no_vat"
            | "no_voec"
            | "nz_gst"
            | "om_vat"
            | "pe_ruc"
            | "ph_tin"
            | "ro_tin"
            | "rs_pib"
            | "ru_inn"
            | "ru_kpp"
            | "sa_vat"
            | "sg_gst"
            | "sg_uen"
            | "si_tin"
            | "sv_nit"
            | "th_vat"
            | "tr_tin"
            | "tw_vat"
            | "ua_vat"
            | "us_ein"
            | "uy_ruc"
            | "ve_rif"
            | "vn_tin"
            | "za_vat"
          > | null;
          userId: string;
        }>
      >;
      listProducts: FunctionReference<
        "query",
        "internal",
        { includeArchived?: boolean },
        Array<{
          createdAt: string;
          description: string | null;
          id: string;
          isArchived: boolean;
          isRecurring: boolean;
          medias: Array<{
            checksumEtag: string | null;
            checksumSha256Base64: string | null;
            checksumSha256Hex: string | null;
            createdAt: string;
            id: string;
            isUploaded: boolean;
            lastModifiedAt: string | null;
            mimeType: string;
            name: string;
            organizationId: string;
            path: string;
            publicUrl: string;
            service?: string;
            size: number;
            sizeReadable: string;
            storageVersion: string | null;
            version: string | null;
          }>;
          metadata?: Record<string, any>;
          modifiedAt: string | null;
          name: string;
          organizationId: string;
          priceAmount?: number;
          prices: Array<{
            amountType?: string;
            createdAt: string;
            id: string;
            isArchived: boolean;
            modifiedAt: string | null;
            priceAmount?: number;
            priceCurrency?: string;
            productId: string;
            recurringInterval?: "month" | "year" | null;
            type?: string;
          }>;
          recurringInterval?: "month" | "year" | null;
        }>
      >;
      listSubscriptions: FunctionReference<
        "query",
        "internal",
        { includeEnded?: boolean },
        Array<{
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          checkoutId: string | null;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          endedAt: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          productId: string;
          recurringInterval: "month" | "year" | null;
          startedAt: string | null;
          status: string;
        }>
      >;
      listUserSubscriptions: FunctionReference<
        "query",
        "internal",
        { userId: string },
        Array<{
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          checkoutId: string | null;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          endedAt: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          product: {
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              createdAt: string;
              id: string;
              isArchived: boolean;
              modifiedAt: string | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: "month" | "year" | null;
              type?: string;
            }>;
            recurringInterval?: "month" | "year" | null;
          } | null;
          productId: string;
          recurringInterval: "month" | "year" | null;
          startedAt: string | null;
          status: string;
        }>
      >;
      syncProducts: FunctionReference<
        "action",
        "internal",
        { polarAccessToken: string; server: "sandbox" | "production" },
        any
      >;
      updateProduct: FunctionReference<
        "mutation",
        "internal",
        {
          product: {
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              createdAt: string;
              id: string;
              isArchived: boolean;
              modifiedAt: string | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: "month" | "year" | null;
              type?: string;
            }>;
            recurringInterval?: "month" | "year" | null;
          };
        },
        any
      >;
      updateProducts: FunctionReference<
        "mutation",
        "internal",
        {
          polarAccessToken: string;
          products: Array<{
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              createdAt: string;
              id: string;
              isArchived: boolean;
              modifiedAt: string | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: "month" | "year" | null;
              type?: string;
            }>;
            recurringInterval?: "month" | "year" | null;
          }>;
        },
        any
      >;
      updateSubscription: FunctionReference<
        "mutation",
        "internal",
        {
          subscription: {
            amount: number | null;
            cancelAtPeriodEnd: boolean;
            checkoutId: string | null;
            createdAt: string;
            currency: string | null;
            currentPeriodEnd: string | null;
            currentPeriodStart: string;
            customerCancellationComment?: string | null;
            customerCancellationReason?: string | null;
            customerId: string;
            endedAt: string | null;
            id: string;
            metadata: Record<string, any>;
            modifiedAt: string | null;
            priceId?: string;
            productId: string;
            recurringInterval: "month" | "year" | null;
            startedAt: string | null;
            status: string;
          };
        },
        any
      >;
      upsertCustomer: FunctionReference<
        "mutation",
        "internal",
        {
          avatar_url?: string | null;
          billing_address?: {
            city: string | null;
            country:
              | "AD"
              | "AE"
              | "AF"
              | "AG"
              | "AI"
              | "AL"
              | "AM"
              | "AO"
              | "AQ"
              | "AR"
              | "AS"
              | "AT"
              | "AU"
              | "AW"
              | "AX"
              | "AZ"
              | "BA"
              | "BB"
              | "BD"
              | "BE"
              | "BF"
              | "BG"
              | "BH"
              | "BI"
              | "BJ"
              | "BL"
              | "BM"
              | "BN"
              | "BO"
              | "BQ"
              | "BR"
              | "BS"
              | "BT"
              | "BV"
              | "BW"
              | "BY"
              | "BZ"
              | "CA"
              | "CC"
              | "CD"
              | "CF"
              | "CG"
              | "CH"
              | "CI"
              | "CK"
              | "CL"
              | "CM"
              | "CN"
              | "CO"
              | "CR"
              | "CU"
              | "CV"
              | "CW"
              | "CX"
              | "CY"
              | "CZ"
              | "DE"
              | "DJ"
              | "DK"
              | "DM"
              | "DO"
              | "DZ"
              | "EC"
              | "EE"
              | "EG"
              | "EH"
              | "ER"
              | "ES"
              | "ET"
              | "FI"
              | "FJ"
              | "FK"
              | "FM"
              | "FO"
              | "FR"
              | "GA"
              | "GB"
              | "GD"
              | "GE"
              | "GF"
              | "GG"
              | "GH"
              | "GI"
              | "GL"
              | "GM"
              | "GN"
              | "GP"
              | "GQ"
              | "GR"
              | "GS"
              | "GT"
              | "GU"
              | "GW"
              | "GY"
              | "HK"
              | "HM"
              | "HN"
              | "HR"
              | "HT"
              | "HU"
              | "ID"
              | "IE"
              | "IL"
              | "IM"
              | "IN"
              | "IO"
              | "IQ"
              | "IR"
              | "IS"
              | "IT"
              | "JE"
              | "JM"
              | "JO"
              | "JP"
              | "KE"
              | "KG"
              | "KH"
              | "KI"
              | "KM"
              | "KN"
              | "KP"
              | "KR"
              | "KW"
              | "KY"
              | "KZ"
              | "LA"
              | "LB"
              | "LC"
              | "LI"
              | "LK"
              | "LR"
              | "LS"
              | "LT"
              | "LU"
              | "LV"
              | "LY"
              | "MA"
              | "MC"
              | "MD"
              | "ME"
              | "MF"
              | "MG"
              | "MH"
              | "MK"
              | "ML"
              | "MM"
              | "MN"
              | "MO"
              | "MP"
              | "MQ"
              | "MR"
              | "MS"
              | "MT"
              | "MU"
              | "MV"
              | "MW"
              | "MX"
              | "MY"
              | "MZ"
              | "NA"
              | "NC"
              | "NE"
              | "NF"
              | "NG"
              | "NI"
              | "NL"
              | "NO"
              | "NP"
              | "NR"
              | "NU"
              | "NZ"
              | "OM"
              | "PA"
              | "PE"
              | "PF"
              | "PG"
              | "PH"
              | "PK"
              | "PL"
              | "PM"
              | "PN"
              | "PR"
              | "PS"
              | "PT"
              | "PW"
              | "PY"
              | "QA"
              | "RE"
              | "RO"
              | "RS"
              | "RU"
              | "RW"
              | "SA"
              | "SB"
              | "SC"
              | "SD"
              | "SE"
              | "SG"
              | "SH"
              | "SI"
              | "SJ"
              | "SK"
              | "SL"
              | "SM"
              | "SN"
              | "SO"
              | "SR"
              | "SS"
              | "ST"
              | "SV"
              | "SX"
              | "SY"
              | "SZ"
              | "TC"
              | "TD"
              | "TF"
              | "TG"
              | "TH"
              | "TJ"
              | "TK"
              | "TL"
              | "TM"
              | "TN"
              | "TO"
              | "TR"
              | "TT"
              | "TV"
              | "TW"
              | "TZ"
              | "UA"
              | "UG"
              | "UM"
              | "US"
              | "UY"
              | "UZ"
              | "VA"
              | "VC"
              | "VE"
              | "VG"
              | "VI"
              | "VN"
              | "VU"
              | "WF"
              | "WS"
              | "YE"
              | "YT"
              | "ZA"
              | "ZM"
              | "ZW";
            line1: string | null;
            line2: string | null;
            postal_code: string | null;
            state: string | null;
          } | null;
          created_at?: string;
          deleted_at?: string | null;
          email?: string;
          email_verified?: boolean;
          external_id?: string | null;
          id: string;
          metadata?: Record<string, string | number | boolean>;
          modified_at?: string | null;
          name?: string | null;
          tax_id?: Array<
            | string
            | "ad_nrt"
            | "ae_trn"
            | "ar_cuit"
            | "au_abn"
            | "au_arn"
            | "bg_uic"
            | "bh_vat"
            | "bo_tin"
            | "br_cnpj"
            | "br_cpf"
            | "ca_bn"
            | "ca_gst_hst"
            | "ca_pst_bc"
            | "ca_pst_mb"
            | "ca_pst_sk"
            | "ca_qst"
            | "ch_uid"
            | "ch_vat"
            | "cl_tin"
            | "cn_tin"
            | "co_nit"
            | "cr_tin"
            | "de_stn"
            | "do_rcn"
            | "ec_ruc"
            | "eg_tin"
            | "es_cif"
            | "eu_oss_vat"
            | "eu_vat"
            | "gb_vat"
            | "ge_vat"
            | "hk_br"
            | "hr_oib"
            | "hu_tin"
            | "id_npwp"
            | "il_vat"
            | "in_gst"
            | "is_vat"
            | "jp_cn"
            | "jp_rn"
            | "jp_trn"
            | "ke_pin"
            | "kr_brn"
            | "kz_bin"
            | "li_uid"
            | "mx_rfc"
            | "my_frp"
            | "my_itn"
            | "my_sst"
            | "ng_tin"
            | "no_vat"
            | "no_voec"
            | "nz_gst"
            | "om_vat"
            | "pe_ruc"
            | "ph_tin"
            | "ro_tin"
            | "rs_pib"
            | "ru_inn"
            | "ru_kpp"
            | "sa_vat"
            | "sg_gst"
            | "sg_uen"
            | "si_tin"
            | "sv_nit"
            | "th_vat"
            | "tr_tin"
            | "tw_vat"
            | "ua_vat"
            | "us_ein"
            | "uy_ruc"
            | "ve_rif"
            | "vn_tin"
            | "za_vat"
          > | null;
          userId: string;
        },
        string
      >;
    };
  };
};
