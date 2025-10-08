/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as lib from "../lib.js";
import type * as types from "../types.js";
import type * as util from "../util.js";

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
  lib: typeof lib;
  types: typeof types;
  util: typeof util;
}>;
export type Mounts = {
  lib: {
    createProduct: FunctionReference<
      "mutation",
      "public",
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
      "public",
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
      "public",
      { userId: string },
      any
    >;
    deleteProduct: FunctionReference<"mutation", "public", { id: string }, any>;
    deleteSubscription: FunctionReference<
      "mutation",
      "public",
      { id: string },
      any
    >;
    getCurrentSubscription: FunctionReference<
      "query",
      "public",
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
      "public",
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
      "public",
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
      "public",
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
      "public",
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
      "public",
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
      "public",
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
      "public",
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
      "public",
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
      "public",
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
      "public",
      { polarAccessToken: string; server: "sandbox" | "production" },
      any
    >;
    updateProduct: FunctionReference<
      "mutation",
      "public",
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
      "public",
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
      "public",
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
      "public",
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
// For now fullApiWithMounts is only fullApi which provides
// jump-to-definition in component client code.
// Use Mounts for the same type without the inference.
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
