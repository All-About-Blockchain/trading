import * as v from "valibot";
import { type ErrorResponse, type SuccessResponse } from "./_base/commonSchemas.js";
/**
 * Action related to validator management.
 * @see null
 */
export declare const CValidatorActionRequest: v.ObjectSchema<{
    /** Validator management action. */
    readonly action: v.VariantSchema<"type", [v.ObjectSchema<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"CValidatorAction", undefined>;
        /** Profile changes to apply. */
        readonly changeProfile: v.ObjectSchema<{
            /** Validator node IP address. */
            readonly node_ip: v.NullableSchema<v.ObjectSchema<{
                /** IP address. */
                readonly Ip: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.IpAction<string, undefined>]>;
            }, undefined>, undefined>;
            /** Validator name. */
            readonly name: v.NullableSchema<v.StringSchema<undefined>, undefined>;
            /** Validator description. */
            readonly description: v.NullableSchema<v.StringSchema<undefined>, undefined>;
            /** Whether the validator is unjailed. */
            readonly unjailed: v.BooleanSchema<undefined>;
            /** Enable or disable delegations. */
            readonly disable_delegations: v.NullableSchema<v.BooleanSchema<undefined>, undefined>;
            /** Commission rate in basis points (1 = 0.0001%). */
            readonly commission_bps: v.NullableSchema<v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
            /** Signer address. */
            readonly signer: v.NullableSchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `0x${string}`>]>, v.LengthAction<`0x${string}`, 42, undefined>]>, undefined>;
        }, undefined>;
    }, undefined>, v.ObjectSchema<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"CValidatorAction", undefined>;
        /** Registration parameters. */
        readonly register: v.ObjectSchema<{
            /** Validator profile information. */
            readonly profile: v.ObjectSchema<{
                /** Validator node IP address. */
                readonly node_ip: v.ObjectSchema<{
                    /** IP address. */
                    readonly Ip: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.IpAction<string, undefined>]>;
                }, undefined>;
                /** Validator name. */
                readonly name: v.StringSchema<undefined>;
                /** Validator description. */
                readonly description: v.StringSchema<undefined>;
                /** Whether delegations are disabled. */
                readonly delegations_disabled: v.BooleanSchema<undefined>;
                /** Commission rate in basis points (1 = 0.0001%). */
                readonly commission_bps: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                /** Signer address. */
                readonly signer: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `0x${string}`>]>, v.LengthAction<`0x${string}`, 42, undefined>]>;
            }, undefined>;
            /** Initial jail status. */
            readonly unjailed: v.BooleanSchema<undefined>;
            /** Initial stake amount in wei. */
            readonly initial_wei: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>;
    }, undefined>, v.ObjectSchema<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"CValidatorAction", undefined>;
        /** Unregister the validator. */
        readonly unregister: v.NullSchema<undefined>;
    }, undefined>], undefined>;
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    readonly nonce: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    /** ECDSA signature components. */
    readonly signature: v.ObjectSchema<{
        readonly r: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `0x${string}`>]>, v.LengthAction<`0x${string}`, 66, undefined>]>;
        readonly s: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `0x${string}`>]>, v.LengthAction<`0x${string}`, 66, undefined>]>;
        readonly v: v.PicklistSchema<[27, 28], undefined>;
    }, undefined>;
    /** Expiration time of the action. */
    readonly expiresAfter: v.OptionalSchema<v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
}, undefined>;
export type CValidatorActionRequest = v.InferOutput<typeof CValidatorActionRequest>;
/**
 * Successful response without specific data or error response.
 * @see null
 */
export type CValidatorActionResponse = SuccessResponse | ErrorResponse;
import type { ExcludeErrorResponse } from "./_base/errors.js";
import { type ExchangeConfig, type ExtractRequestOptions } from "./_base/execute.js";
/** Schema for user-provided action parameters (excludes system fields). */
declare const CValidatorActionParameters: v.UnionSchema<((Omit<v.ObjectSchema<{
    /** Type of action. */
    readonly type: v.LiteralSchema<"CValidatorAction", undefined>;
    /** Profile changes to apply. */
    readonly changeProfile: v.ObjectSchema<{
        /** Validator node IP address. */
        readonly node_ip: v.NullableSchema<v.ObjectSchema<{
            /** IP address. */
            readonly Ip: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.IpAction<string, undefined>]>;
        }, undefined>, undefined>;
        /** Validator name. */
        readonly name: v.NullableSchema<v.StringSchema<undefined>, undefined>;
        /** Validator description. */
        readonly description: v.NullableSchema<v.StringSchema<undefined>, undefined>;
        /** Whether the validator is unjailed. */
        readonly unjailed: v.BooleanSchema<undefined>;
        /** Enable or disable delegations. */
        readonly disable_delegations: v.NullableSchema<v.BooleanSchema<undefined>, undefined>;
        /** Commission rate in basis points (1 = 0.0001%). */
        readonly commission_bps: v.NullableSchema<v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
        /** Signer address. */
        readonly signer: v.NullableSchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `0x${string}`>]>, v.LengthAction<`0x${string}`, 42, undefined>]>, undefined>;
    }, undefined>;
}, undefined>, "~types" | "~run" | "~standard" | "entries"> & {
    readonly entries: Omit<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"CValidatorAction", undefined>;
        /** Profile changes to apply. */
        readonly changeProfile: v.ObjectSchema<{
            /** Validator node IP address. */
            readonly node_ip: v.NullableSchema<v.ObjectSchema<{
                /** IP address. */
                readonly Ip: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.IpAction<string, undefined>]>;
            }, undefined>, undefined>;
            /** Validator name. */
            readonly name: v.NullableSchema<v.StringSchema<undefined>, undefined>;
            /** Validator description. */
            readonly description: v.NullableSchema<v.StringSchema<undefined>, undefined>;
            /** Whether the validator is unjailed. */
            readonly unjailed: v.BooleanSchema<undefined>;
            /** Enable or disable delegations. */
            readonly disable_delegations: v.NullableSchema<v.BooleanSchema<undefined>, undefined>;
            /** Commission rate in basis points (1 = 0.0001%). */
            readonly commission_bps: v.NullableSchema<v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
            /** Signer address. */
            readonly signer: v.NullableSchema<v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `0x${string}`>]>, v.LengthAction<`0x${string}`, 42, undefined>]>, undefined>;
        }, undefined>;
    }, "type">;
    readonly "~standard": v.StandardProps<{
        changeProfile: {
            node_ip: {
                Ip: string;
            } | null;
            name: string | null;
            description: string | null;
            unjailed: boolean;
            disable_delegations: boolean | null;
            commission_bps: string | number | null;
            signer: string | null;
        };
    }, {
        changeProfile: {
            node_ip: {
                Ip: string;
            } | null;
            name: string | null;
            description: string | null;
            unjailed: boolean;
            disable_delegations: boolean | null;
            commission_bps: number | null;
            signer: `0x${string}` | null;
        };
    }>;
    readonly "~run": (dataset: v.UnknownDataset, config: v.Config<v.BaseIssue<unknown>>) => v.OutputDataset<{
        changeProfile: {
            node_ip: {
                Ip: string;
            } | null;
            name: string | null;
            description: string | null;
            unjailed: boolean;
            disable_delegations: boolean | null;
            commission_bps: number | null;
            signer: `0x${string}` | null;
        };
    }, v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.RegexIssue<string> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.LengthIssue<`0x${string}`, 42> | v.ObjectIssue | v.BooleanIssue | v.IpIssue<string>>;
    readonly "~types"?: {
        readonly input: {
            changeProfile: {
                node_ip: {
                    Ip: string;
                } | null;
                name: string | null;
                description: string | null;
                unjailed: boolean;
                disable_delegations: boolean | null;
                commission_bps: string | number | null;
                signer: string | null;
            };
        };
        readonly output: {
            changeProfile: {
                node_ip: {
                    Ip: string;
                } | null;
                name: string | null;
                description: string | null;
                unjailed: boolean;
                disable_delegations: boolean | null;
                commission_bps: number | null;
                signer: `0x${string}` | null;
            };
        };
        readonly issue: v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.RegexIssue<string> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.LengthIssue<`0x${string}`, 42> | v.ObjectIssue | v.BooleanIssue | v.IpIssue<string>;
    } | undefined;
}) | (Omit<v.ObjectSchema<{
    /** Type of action. */
    readonly type: v.LiteralSchema<"CValidatorAction", undefined>;
    /** Registration parameters. */
    readonly register: v.ObjectSchema<{
        /** Validator profile information. */
        readonly profile: v.ObjectSchema<{
            /** Validator node IP address. */
            readonly node_ip: v.ObjectSchema<{
                /** IP address. */
                readonly Ip: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.IpAction<string, undefined>]>;
            }, undefined>;
            /** Validator name. */
            readonly name: v.StringSchema<undefined>;
            /** Validator description. */
            readonly description: v.StringSchema<undefined>;
            /** Whether delegations are disabled. */
            readonly delegations_disabled: v.BooleanSchema<undefined>;
            /** Commission rate in basis points (1 = 0.0001%). */
            readonly commission_bps: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            /** Signer address. */
            readonly signer: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `0x${string}`>]>, v.LengthAction<`0x${string}`, 42, undefined>]>;
        }, undefined>;
        /** Initial jail status. */
        readonly unjailed: v.BooleanSchema<undefined>;
        /** Initial stake amount in wei. */
        readonly initial_wei: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>;
}, undefined>, "~types" | "~run" | "~standard" | "entries"> & {
    readonly entries: Omit<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"CValidatorAction", undefined>;
        /** Registration parameters. */
        readonly register: v.ObjectSchema<{
            /** Validator profile information. */
            readonly profile: v.ObjectSchema<{
                /** Validator node IP address. */
                readonly node_ip: v.ObjectSchema<{
                    /** IP address. */
                    readonly Ip: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.IpAction<string, undefined>]>;
                }, undefined>;
                /** Validator name. */
                readonly name: v.StringSchema<undefined>;
                /** Validator description. */
                readonly description: v.StringSchema<undefined>;
                /** Whether delegations are disabled. */
                readonly delegations_disabled: v.BooleanSchema<undefined>;
                /** Commission rate in basis points (1 = 0.0001%). */
                readonly commission_bps: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                /** Signer address. */
                readonly signer: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `0x${string}`>]>, v.LengthAction<`0x${string}`, 42, undefined>]>;
            }, undefined>;
            /** Initial jail status. */
            readonly unjailed: v.BooleanSchema<undefined>;
            /** Initial stake amount in wei. */
            readonly initial_wei: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>;
    }, "type">;
    readonly "~standard": v.StandardProps<{
        register: {
            profile: {
                node_ip: {
                    Ip: string;
                };
                name: string;
                description: string;
                delegations_disabled: boolean;
                commission_bps: string | number;
                signer: string;
            };
            unjailed: boolean;
            initial_wei: string | number;
        };
    }, {
        register: {
            profile: {
                node_ip: {
                    Ip: string;
                };
                name: string;
                description: string;
                delegations_disabled: boolean;
                commission_bps: number;
                signer: `0x${string}`;
            };
            unjailed: boolean;
            initial_wei: number;
        };
    }>;
    readonly "~run": (dataset: v.UnknownDataset, config: v.Config<v.BaseIssue<unknown>>) => v.OutputDataset<{
        register: {
            profile: {
                node_ip: {
                    Ip: string;
                };
                name: string;
                description: string;
                delegations_disabled: boolean;
                commission_bps: number;
                signer: `0x${string}`;
            };
            unjailed: boolean;
            initial_wei: number;
        };
    }, v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.RegexIssue<string> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.LengthIssue<`0x${string}`, 42> | v.ObjectIssue | v.BooleanIssue | v.IpIssue<string>>;
    readonly "~types"?: {
        readonly input: {
            register: {
                profile: {
                    node_ip: {
                        Ip: string;
                    };
                    name: string;
                    description: string;
                    delegations_disabled: boolean;
                    commission_bps: string | number;
                    signer: string;
                };
                unjailed: boolean;
                initial_wei: string | number;
            };
        };
        readonly output: {
            register: {
                profile: {
                    node_ip: {
                        Ip: string;
                    };
                    name: string;
                    description: string;
                    delegations_disabled: boolean;
                    commission_bps: number;
                    signer: `0x${string}`;
                };
                unjailed: boolean;
                initial_wei: number;
            };
        };
        readonly issue: v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.RegexIssue<string> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.LengthIssue<`0x${string}`, 42> | v.ObjectIssue | v.BooleanIssue | v.IpIssue<string>;
    } | undefined;
}) | (Omit<v.ObjectSchema<{
    /** Type of action. */
    readonly type: v.LiteralSchema<"CValidatorAction", undefined>;
    /** Unregister the validator. */
    readonly unregister: v.NullSchema<undefined>;
}, undefined>, "~types" | "~run" | "~standard" | "entries"> & {
    readonly entries: Omit<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"CValidatorAction", undefined>;
        /** Unregister the validator. */
        readonly unregister: v.NullSchema<undefined>;
    }, "type">;
    readonly "~standard": v.StandardProps<{
        unregister: null;
    }, {
        unregister: null;
    }>;
    readonly "~run": (dataset: v.UnknownDataset, config: v.Config<v.BaseIssue<unknown>>) => v.OutputDataset<{
        unregister: null;
    }, v.ObjectIssue | v.NullIssue>;
    readonly "~types"?: {
        readonly input: {
            unregister: null;
        };
        readonly output: {
            unregister: null;
        };
        readonly issue: v.ObjectIssue | v.NullIssue;
    } | undefined;
}))[], undefined>;
/** Action parameters for the {@linkcode cValidatorAction} function. */
export type CValidatorActionParameters = v.InferInput<typeof CValidatorActionParameters>;
/** Request options for the {@linkcode cValidatorAction} function. */
export type CValidatorActionOptions = ExtractRequestOptions<v.InferInput<typeof CValidatorActionRequest>>;
/** Successful variant of {@linkcode CValidatorActionResponse} without errors. */
export type CValidatorActionSuccessResponse = ExcludeErrorResponse<CValidatorActionResponse>;
/**
 * Action related to validator management.
 *
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Successful response without specific data.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example Change validator profile
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { cValidatorAction } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await cValidatorAction(
 *   { transport, wallet },
 *   {
 *     changeProfile: {
 *       node_ip: { Ip: "1.2.3.4" },
 *       name: "...",
 *       description: "...",
 *       unjailed: true,
 *       disable_delegations: false,
 *       commission_bps: null,
 *       signer: null,
 *     },
 *   },
 * );
 * ```
 *
 * @see null
 */
export declare function cValidatorAction(config: ExchangeConfig, params: CValidatorActionParameters, opts?: CValidatorActionOptions): Promise<CValidatorActionSuccessResponse>;
export {};
//# sourceMappingURL=cValidatorAction.d.ts.map