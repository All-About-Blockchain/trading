import * as v from "valibot";
import { type ErrorResponse, type SuccessResponse } from "./_base/commonSchemas.js";
/**
 * Deploying HIP-1 and HIP-2 assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export declare const SpotDeployRequest: v.ObjectSchema<{
    /** Action to perform. */
    readonly action: v.VariantSchema<"type", [v.ObjectSchema<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** Register token parameters. */
        readonly registerToken2: v.ObjectSchema<{
            /** Token specifications. */
            readonly spec: v.ObjectSchema<{
                /** Token name. */
                readonly name: v.StringSchema<undefined>;
                /** Number of decimals for token size. */
                readonly szDecimals: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                /** Number of decimals for token amounts in wei. */
                readonly weiDecimals: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>;
            /** Maximum gas allowed for registration. */
            readonly maxGas: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            /** Optional full token name. */
            readonly fullName: v.OptionalSchema<v.StringSchema<undefined>, undefined>;
        }, undefined>;
    }, undefined>, v.ObjectSchema<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** User genesis parameters. */
        readonly userGenesis: v.ObjectSchema<{
            /** Token identifier. */
            readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            /** Array of tuples: [user address, genesis amount in wei]. */
            readonly userAndWei: v.ArraySchema<v.TupleSchema<[v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `0x${string}`>]>, v.LengthAction<`0x${string}`, 42, undefined>]>, v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>], undefined>, undefined>;
            /** Array of tuples: [existing token identifier, genesis amount in wei]. */
            readonly existingTokenAndWei: v.ArraySchema<v.TupleSchema<[v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>], undefined>, undefined>;
            /** Array of tuples: [user address, blacklist status] (`true` for blacklist, `false` to remove existing blacklisted user). */
            readonly blacklistUsers: v.OptionalSchema<v.ArraySchema<v.TupleSchema<[v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `0x${string}`>]>, v.LengthAction<`0x${string}`, 42, undefined>]>, v.BooleanSchema<undefined>], undefined>, undefined>, undefined>;
        }, undefined>;
    }, undefined>, v.ObjectSchema<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** Genesis parameters. */
        readonly genesis: v.ObjectSchema<{
            /** Token identifier. */
            readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            /** Maximum token supply. */
            readonly maxSupply: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>;
            /** Set hyperliquidity balance to 0. */
            readonly noHyperliquidity: v.OptionalSchema<v.LiteralSchema<true, undefined>, undefined>;
        }, undefined>;
    }, undefined>, v.ObjectSchema<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** Register spot parameters. */
        readonly registerSpot: v.ObjectSchema<{
            /** Tuple containing base and quote token indices. */
            readonly tokens: v.TupleSchema<[v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>], undefined>;
        }, undefined>;
    }, undefined>, v.ObjectSchema<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** Register hyperliquidity parameters. */
        readonly registerHyperliquidity: v.ObjectSchema<{
            /** Spot index (distinct from base token index). */
            readonly spot: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            /** Starting price for liquidity seeding. */
            readonly startPx: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>;
            /** Order size as a float (not in wei). */
            readonly orderSz: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>;
            /** Total number of orders to place. */
            readonly nOrders: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            /** Number of levels to seed with USDC. */
            readonly nSeededLevels: v.OptionalSchema<v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
        }, undefined>;
    }, undefined>, v.ObjectSchema<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** Set deployer trading fee share parameters. */
        readonly setDeployerTradingFeeShare: v.ObjectSchema<{
            /** Token identifier. */
            readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            /** The deployer trading fee share. Range is 0% to 100%. */
            readonly share: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `${string}%`>]>;
        }, undefined>;
    }, undefined>, v.ObjectSchema<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** Enable quote token parameters. */
        readonly enableQuoteToken: v.ObjectSchema<{
            /** The token ID to convert to a quote token. */
            readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>;
    }, undefined>, v.ObjectSchema<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** Enable aligned quote token parameters. */
        readonly enableAlignedQuoteToken: v.ObjectSchema<{
            /** Token identifier to enable as aligned quote token. */
            readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>;
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
export type SpotDeployRequest = v.InferOutput<typeof SpotDeployRequest>;
/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export type SpotDeployResponse = SuccessResponse | ErrorResponse;
import type { ExcludeErrorResponse } from "./_base/errors.js";
import { type ExchangeConfig, type ExtractRequestOptions } from "./_base/execute.js";
/** Schema for user-provided action parameters (excludes system fields). */
declare const SpotDeployParameters: v.UnionSchema<((Omit<v.ObjectSchema<{
    /** Type of action. */
    readonly type: v.LiteralSchema<"spotDeploy", undefined>;
    /** Register token parameters. */
    readonly registerToken2: v.ObjectSchema<{
        /** Token specifications. */
        readonly spec: v.ObjectSchema<{
            /** Token name. */
            readonly name: v.StringSchema<undefined>;
            /** Number of decimals for token size. */
            readonly szDecimals: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            /** Number of decimals for token amounts in wei. */
            readonly weiDecimals: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>;
        /** Maximum gas allowed for registration. */
        readonly maxGas: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        /** Optional full token name. */
        readonly fullName: v.OptionalSchema<v.StringSchema<undefined>, undefined>;
    }, undefined>;
}, undefined>, "~types" | "~run" | "~standard" | "entries"> & {
    readonly entries: Omit<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** Register token parameters. */
        readonly registerToken2: v.ObjectSchema<{
            /** Token specifications. */
            readonly spec: v.ObjectSchema<{
                /** Token name. */
                readonly name: v.StringSchema<undefined>;
                /** Number of decimals for token size. */
                readonly szDecimals: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
                /** Number of decimals for token amounts in wei. */
                readonly weiDecimals: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            }, undefined>;
            /** Maximum gas allowed for registration. */
            readonly maxGas: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            /** Optional full token name. */
            readonly fullName: v.OptionalSchema<v.StringSchema<undefined>, undefined>;
        }, undefined>;
    }, "type">;
    readonly "~standard": v.StandardProps<{
        registerToken2: {
            spec: {
                name: string;
                szDecimals: string | number;
                weiDecimals: string | number;
            };
            maxGas: string | number;
            fullName?: string | undefined;
        };
    }, {
        registerToken2: {
            spec: {
                name: string;
                szDecimals: number;
                weiDecimals: number;
            };
            maxGas: number;
            fullName?: string | undefined;
        };
    }>;
    readonly "~run": (dataset: v.UnknownDataset, config: v.Config<v.BaseIssue<unknown>>) => v.OutputDataset<{
        registerToken2: {
            spec: {
                name: string;
                szDecimals: number;
                weiDecimals: number;
            };
            maxGas: number;
            fullName?: string | undefined;
        };
    }, v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.ObjectIssue>;
    readonly "~types"?: {
        readonly input: {
            registerToken2: {
                spec: {
                    name: string;
                    szDecimals: string | number;
                    weiDecimals: string | number;
                };
                maxGas: string | number;
                fullName?: string | undefined;
            };
        };
        readonly output: {
            registerToken2: {
                spec: {
                    name: string;
                    szDecimals: number;
                    weiDecimals: number;
                };
                maxGas: number;
                fullName?: string | undefined;
            };
        };
        readonly issue: v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.ObjectIssue;
    } | undefined;
}) | (Omit<v.ObjectSchema<{
    /** Type of action. */
    readonly type: v.LiteralSchema<"spotDeploy", undefined>;
    /** User genesis parameters. */
    readonly userGenesis: v.ObjectSchema<{
        /** Token identifier. */
        readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        /** Array of tuples: [user address, genesis amount in wei]. */
        readonly userAndWei: v.ArraySchema<v.TupleSchema<[v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `0x${string}`>]>, v.LengthAction<`0x${string}`, 42, undefined>]>, v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>], undefined>, undefined>;
        /** Array of tuples: [existing token identifier, genesis amount in wei]. */
        readonly existingTokenAndWei: v.ArraySchema<v.TupleSchema<[v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>], undefined>, undefined>;
        /** Array of tuples: [user address, blacklist status] (`true` for blacklist, `false` to remove existing blacklisted user). */
        readonly blacklistUsers: v.OptionalSchema<v.ArraySchema<v.TupleSchema<[v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `0x${string}`>]>, v.LengthAction<`0x${string}`, 42, undefined>]>, v.BooleanSchema<undefined>], undefined>, undefined>, undefined>;
    }, undefined>;
}, undefined>, "~types" | "~run" | "~standard" | "entries"> & {
    readonly entries: Omit<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** User genesis parameters. */
        readonly userGenesis: v.ObjectSchema<{
            /** Token identifier. */
            readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            /** Array of tuples: [user address, genesis amount in wei]. */
            readonly userAndWei: v.ArraySchema<v.TupleSchema<[v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `0x${string}`>]>, v.LengthAction<`0x${string}`, 42, undefined>]>, v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>], undefined>, undefined>;
            /** Array of tuples: [existing token identifier, genesis amount in wei]. */
            readonly existingTokenAndWei: v.ArraySchema<v.TupleSchema<[v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>], undefined>, undefined>;
            /** Array of tuples: [user address, blacklist status] (`true` for blacklist, `false` to remove existing blacklisted user). */
            readonly blacklistUsers: v.OptionalSchema<v.ArraySchema<v.TupleSchema<[v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `0x${string}`>]>, v.LengthAction<`0x${string}`, 42, undefined>]>, v.BooleanSchema<undefined>], undefined>, undefined>, undefined>;
        }, undefined>;
    }, "type">;
    readonly "~standard": v.StandardProps<{
        userGenesis: {
            token: string | number;
            userAndWei: [string, string | number][];
            existingTokenAndWei: [string | number, string | number][];
            blacklistUsers?: [string, boolean][] | undefined;
        };
    }, {
        userGenesis: {
            token: number;
            userAndWei: [`0x${string}`, string][];
            existingTokenAndWei: [number, string][];
            blacklistUsers?: [`0x${string}`, boolean][] | undefined;
        };
    }>;
    readonly "~run": (dataset: v.UnknownDataset, config: v.Config<v.BaseIssue<unknown>>) => v.OutputDataset<{
        userGenesis: {
            token: number;
            userAndWei: [`0x${string}`, string][];
            existingTokenAndWei: [number, string][];
            blacklistUsers?: [`0x${string}`, boolean][] | undefined;
        };
    }, v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.ToStringIssue<string | number> | v.RegexIssue<string> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.LengthIssue<`0x${string}`, 42> | v.ObjectIssue | v.ArrayIssue | v.BooleanIssue | v.TupleIssue>;
    readonly "~types"?: {
        readonly input: {
            userGenesis: {
                token: string | number;
                userAndWei: [string, string | number][];
                existingTokenAndWei: [string | number, string | number][];
                blacklistUsers?: [string, boolean][] | undefined;
            };
        };
        readonly output: {
            userGenesis: {
                token: number;
                userAndWei: [`0x${string}`, string][];
                existingTokenAndWei: [number, string][];
                blacklistUsers?: [`0x${string}`, boolean][] | undefined;
            };
        };
        readonly issue: v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.ToStringIssue<string | number> | v.RegexIssue<string> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.LengthIssue<`0x${string}`, 42> | v.ObjectIssue | v.ArrayIssue | v.BooleanIssue | v.TupleIssue;
    } | undefined;
}) | (Omit<v.ObjectSchema<{
    /** Type of action. */
    readonly type: v.LiteralSchema<"spotDeploy", undefined>;
    /** Genesis parameters. */
    readonly genesis: v.ObjectSchema<{
        /** Token identifier. */
        readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        /** Maximum token supply. */
        readonly maxSupply: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>;
        /** Set hyperliquidity balance to 0. */
        readonly noHyperliquidity: v.OptionalSchema<v.LiteralSchema<true, undefined>, undefined>;
    }, undefined>;
}, undefined>, "~types" | "~run" | "~standard" | "entries"> & {
    readonly entries: Omit<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** Genesis parameters. */
        readonly genesis: v.ObjectSchema<{
            /** Token identifier. */
            readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            /** Maximum token supply. */
            readonly maxSupply: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>;
            /** Set hyperliquidity balance to 0. */
            readonly noHyperliquidity: v.OptionalSchema<v.LiteralSchema<true, undefined>, undefined>;
        }, undefined>;
    }, "type">;
    readonly "~standard": v.StandardProps<{
        genesis: {
            token: string | number;
            maxSupply: string | number;
            noHyperliquidity?: true | undefined;
        };
    }, {
        genesis: {
            token: number;
            maxSupply: string;
            noHyperliquidity?: true | undefined;
        };
    }>;
    readonly "~run": (dataset: v.UnknownDataset, config: v.Config<v.BaseIssue<unknown>>) => v.OutputDataset<{
        genesis: {
            token: number;
            maxSupply: string;
            noHyperliquidity?: true | undefined;
        };
    }, v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.ToStringIssue<string | number> | v.RegexIssue<string> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.ObjectIssue | v.LiteralIssue>;
    readonly "~types"?: {
        readonly input: {
            genesis: {
                token: string | number;
                maxSupply: string | number;
                noHyperliquidity?: true | undefined;
            };
        };
        readonly output: {
            genesis: {
                token: number;
                maxSupply: string;
                noHyperliquidity?: true | undefined;
            };
        };
        readonly issue: v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.ToStringIssue<string | number> | v.RegexIssue<string> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.ObjectIssue | v.LiteralIssue;
    } | undefined;
}) | (Omit<v.ObjectSchema<{
    /** Type of action. */
    readonly type: v.LiteralSchema<"spotDeploy", undefined>;
    /** Register spot parameters. */
    readonly registerSpot: v.ObjectSchema<{
        /** Tuple containing base and quote token indices. */
        readonly tokens: v.TupleSchema<[v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>], undefined>;
    }, undefined>;
}, undefined>, "~types" | "~run" | "~standard" | "entries"> & {
    readonly entries: Omit<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** Register spot parameters. */
        readonly registerSpot: v.ObjectSchema<{
            /** Tuple containing base and quote token indices. */
            readonly tokens: v.TupleSchema<[v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>], undefined>;
        }, undefined>;
    }, "type">;
    readonly "~standard": v.StandardProps<{
        registerSpot: {
            tokens: [string | number, string | number];
        };
    }, {
        registerSpot: {
            tokens: [number, number];
        };
    }>;
    readonly "~run": (dataset: v.UnknownDataset, config: v.Config<v.BaseIssue<unknown>>) => v.OutputDataset<{
        registerSpot: {
            tokens: [number, number];
        };
    }, v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.ObjectIssue | v.TupleIssue>;
    readonly "~types"?: {
        readonly input: {
            registerSpot: {
                tokens: [string | number, string | number];
            };
        };
        readonly output: {
            registerSpot: {
                tokens: [number, number];
            };
        };
        readonly issue: v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.ObjectIssue | v.TupleIssue;
    } | undefined;
}) | (Omit<v.ObjectSchema<{
    /** Type of action. */
    readonly type: v.LiteralSchema<"spotDeploy", undefined>;
    /** Register hyperliquidity parameters. */
    readonly registerHyperliquidity: v.ObjectSchema<{
        /** Spot index (distinct from base token index). */
        readonly spot: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        /** Starting price for liquidity seeding. */
        readonly startPx: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>;
        /** Order size as a float (not in wei). */
        readonly orderSz: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>;
        /** Total number of orders to place. */
        readonly nOrders: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        /** Number of levels to seed with USDC. */
        readonly nSeededLevels: v.OptionalSchema<v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
    }, undefined>;
}, undefined>, "~types" | "~run" | "~standard" | "entries"> & {
    readonly entries: Omit<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** Register hyperliquidity parameters. */
        readonly registerHyperliquidity: v.ObjectSchema<{
            /** Spot index (distinct from base token index). */
            readonly spot: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            /** Starting price for liquidity seeding. */
            readonly startPx: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>;
            /** Order size as a float (not in wei). */
            readonly orderSz: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToStringAction<string | number, undefined>, v.StringSchema<undefined>, v.TransformAction<string, string>, v.RegexAction<string, undefined>]>;
            /** Total number of orders to place. */
            readonly nOrders: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            /** Number of levels to seed with USDC. */
            readonly nSeededLevels: v.OptionalSchema<v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
        }, undefined>;
    }, "type">;
    readonly "~standard": v.StandardProps<{
        registerHyperliquidity: {
            spot: string | number;
            startPx: string | number;
            orderSz: string | number;
            nOrders: string | number;
            nSeededLevels?: string | number | undefined;
        };
    }, {
        registerHyperliquidity: {
            spot: number;
            startPx: string;
            orderSz: string;
            nOrders: number;
            nSeededLevels?: number | undefined;
        };
    }>;
    readonly "~run": (dataset: v.UnknownDataset, config: v.Config<v.BaseIssue<unknown>>) => v.OutputDataset<{
        registerHyperliquidity: {
            spot: number;
            startPx: string;
            orderSz: string;
            nOrders: number;
            nSeededLevels?: number | undefined;
        };
    }, v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.ToStringIssue<string | number> | v.RegexIssue<string> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.ObjectIssue>;
    readonly "~types"?: {
        readonly input: {
            registerHyperliquidity: {
                spot: string | number;
                startPx: string | number;
                orderSz: string | number;
                nOrders: string | number;
                nSeededLevels?: string | number | undefined;
            };
        };
        readonly output: {
            registerHyperliquidity: {
                spot: number;
                startPx: string;
                orderSz: string;
                nOrders: number;
                nSeededLevels?: number | undefined;
            };
        };
        readonly issue: v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.ToStringIssue<string | number> | v.RegexIssue<string> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.ObjectIssue;
    } | undefined;
}) | (Omit<v.ObjectSchema<{
    /** Type of action. */
    readonly type: v.LiteralSchema<"spotDeploy", undefined>;
    /** Set deployer trading fee share parameters. */
    readonly setDeployerTradingFeeShare: v.ObjectSchema<{
        /** Token identifier. */
        readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        /** The deployer trading fee share. Range is 0% to 100%. */
        readonly share: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `${string}%`>]>;
    }, undefined>;
}, undefined>, "~types" | "~run" | "~standard" | "entries"> & {
    readonly entries: Omit<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** Set deployer trading fee share parameters. */
        readonly setDeployerTradingFeeShare: v.ObjectSchema<{
            /** Token identifier. */
            readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            /** The deployer trading fee share. Range is 0% to 100%. */
            readonly share: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>, v.TransformAction<string, `${string}%`>]>;
        }, undefined>;
    }, "type">;
    readonly "~standard": v.StandardProps<{
        setDeployerTradingFeeShare: {
            token: string | number;
            share: string;
        };
    }, {
        setDeployerTradingFeeShare: {
            token: number;
            share: `${string}%`;
        };
    }>;
    readonly "~run": (dataset: v.UnknownDataset, config: v.Config<v.BaseIssue<unknown>>) => v.OutputDataset<{
        setDeployerTradingFeeShare: {
            token: number;
            share: `${string}%`;
        };
    }, v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.RegexIssue<string> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.ObjectIssue>;
    readonly "~types"?: {
        readonly input: {
            setDeployerTradingFeeShare: {
                token: string | number;
                share: string;
            };
        };
        readonly output: {
            setDeployerTradingFeeShare: {
                token: number;
                share: `${string}%`;
            };
        };
        readonly issue: v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.RegexIssue<string> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.ObjectIssue;
    } | undefined;
}) | (Omit<v.ObjectSchema<{
    /** Type of action. */
    readonly type: v.LiteralSchema<"spotDeploy", undefined>;
    /** Enable quote token parameters. */
    readonly enableQuoteToken: v.ObjectSchema<{
        /** The token ID to convert to a quote token. */
        readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>;
}, undefined>, "~types" | "~run" | "~standard" | "entries"> & {
    readonly entries: Omit<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** Enable quote token parameters. */
        readonly enableQuoteToken: v.ObjectSchema<{
            /** The token ID to convert to a quote token. */
            readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>;
    }, "type">;
    readonly "~standard": v.StandardProps<{
        enableQuoteToken: {
            token: string | number;
        };
    }, {
        enableQuoteToken: {
            token: number;
        };
    }>;
    readonly "~run": (dataset: v.UnknownDataset, config: v.Config<v.BaseIssue<unknown>>) => v.OutputDataset<{
        enableQuoteToken: {
            token: number;
        };
    }, v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.ObjectIssue>;
    readonly "~types"?: {
        readonly input: {
            enableQuoteToken: {
                token: string | number;
            };
        };
        readonly output: {
            enableQuoteToken: {
                token: number;
            };
        };
        readonly issue: v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.ObjectIssue;
    } | undefined;
}) | (Omit<v.ObjectSchema<{
    /** Type of action. */
    readonly type: v.LiteralSchema<"spotDeploy", undefined>;
    /** Enable aligned quote token parameters. */
    readonly enableAlignedQuoteToken: v.ObjectSchema<{
        /** Token identifier to enable as aligned quote token. */
        readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>;
}, undefined>, "~types" | "~run" | "~standard" | "entries"> & {
    readonly entries: Omit<{
        /** Type of action. */
        readonly type: v.LiteralSchema<"spotDeploy", undefined>;
        /** Enable aligned quote token parameters. */
        readonly enableAlignedQuoteToken: v.ObjectSchema<{
            /** Token identifier to enable as aligned quote token. */
            readonly token: v.SchemaWithPipe<readonly [v.UnionSchema<[v.StringSchema<undefined>, v.NumberSchema<undefined>], undefined>, v.ToNumberAction<string | number, undefined>, v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>;
    }, "type">;
    readonly "~standard": v.StandardProps<{
        enableAlignedQuoteToken: {
            token: string | number;
        };
    }, {
        enableAlignedQuoteToken: {
            token: number;
        };
    }>;
    readonly "~run": (dataset: v.UnknownDataset, config: v.Config<v.BaseIssue<unknown>>) => v.OutputDataset<{
        enableAlignedQuoteToken: {
            token: number;
        };
    }, v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.ObjectIssue>;
    readonly "~types"?: {
        readonly input: {
            enableAlignedQuoteToken: {
                token: string | number;
            };
        };
        readonly output: {
            enableAlignedQuoteToken: {
                token: number;
            };
        };
        readonly issue: v.StringIssue | v.NumberIssue | v.UnionIssue<v.StringIssue | v.NumberIssue> | v.ToNumberIssue<string | number> | v.SafeIntegerIssue<number> | v.MinValueIssue<number, 0> | v.ObjectIssue;
    } | undefined;
}))[], undefined>;
/** Action parameters for the {@linkcode spotDeploy} function. */
export type SpotDeployParameters = v.InferInput<typeof SpotDeployParameters>;
/** Request options for the {@linkcode spotDeploy} function. */
export type SpotDeployOptions = ExtractRequestOptions<v.InferInput<typeof SpotDeployRequest>>;
/** Successful variant of {@linkcode SpotDeployResponse} without errors. */
export type SpotDeploySuccessResponse = ExcludeErrorResponse<SpotDeployResponse>;
/**
 * Deploying HIP-1 and HIP-2 assets.
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
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { spotDeploy } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await spotDeploy(
 *   { transport, wallet },
 *   {
 *     registerToken2: {
 *       spec: {
 *         name: "USDC",
 *         szDecimals: 8,
 *         weiDecimals: 8,
 *       },
 *       maxGas: 1000000,
 *       fullName: "USD Coin",
 *     },
 *   },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export declare function spotDeploy(config: ExchangeConfig, params: SpotDeployParameters, opts?: SpotDeployOptions): Promise<SpotDeploySuccessResponse>;
export {};
//# sourceMappingURL=spotDeploy.d.ts.map