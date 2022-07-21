/**
 * 专门用于构建的相关工具
 *
 * @remarks
 * 本库封装了前端构建时常用的工具、函数等
 *
 * @packageDocumentation
 */
/// <reference types="node" />
import { cp } from "node:fs/promises";
import type { LibrariesOptions } from "dts-bundle-generator";
export declare type CopyOptions = NonNullable<Parameters<typeof cp>[2]> & {
    /**
     * 需要排除的文件或目录名字
     *
     * @remarks
     * 如果 指定了 filter 选项，则 exclude 无效
     */
    exclude?: string[] | null;
};
/**
 * 拷贝 TypeScript 的类型声明文件
 * @remarks
 * 将 源目录 中 TypeScript 类型声明文件 拷贝到 目标目录下。
 * 如果源目录下的子目录中没有 类型声明文件，则也会在目标目录下创建空的文件夹。
 *
 * @param src - 源目录
 * @param dest - 目标目录
 * @param options - 选项
 */
export declare function copy_d_ts(src: string, dest: string, options?: CopyOptions): Promise<void>;
/**
 * generate_d_ts 的选项
 */
export interface Generate_D_TS_Options extends Tsc_d_ts_Options {
    /**
     * 是否拷贝项目中已有的 `.d.ts` 文件
     *
     * @defaultValue true
     */
    copyDTS?: boolean | null | CopyOptions;
    /**
     * 是否要在当前进程将要退出时执行
     *
     * @defaultValue true
     */
    onExit?: boolean | null;
    /**
     * 是否清空输出目录
     */
    emptyOutDir?: boolean | null;
}
/**
 * 生成 TypeScript 类型声明文件
 * @remarks
 * 通过 tsc 命令生成 TypeScript 类型声明文件，并且可以拷贝 源目录下的  `.d.ts` 文件到输出目录中。
 *
 * 如果源目录下的子目录中没有 类型声明文件，则也会在目标目录下创建空的文件夹。
 *
 * 注意：tsc 命令本身不会拷贝项目中已有的 `.d.ts` 文件。
 *
 * @param src - 源目录
 * @param dest - 存放生成的 `.d.ts` 的输出目录
 * @param options - 选项
 * @returns 操作完成的 Promise
 */
export declare function generate_d_ts(src: string, dest: string, options?: Generate_D_TS_Options | null): Promise<unknown[]>;
/**
 * tsc_d_ts 的选项
 */
export interface Tsc_d_ts_Options {
    /**
     * 作为单一输出文件的名字
     * @remarks
     * 会放在输出目录下
     */
    outFile?: string | null;
    /**
     * 传给 `tsc` 命令的选项
     *
     * @defaultValue ""
     */
    comArg?: string | null;
    /**
     * dtsBundle 额外选项
     *
     * @remarks
     * 当此选项为真值时，会使用 dts-bundle-generator 来生成单个的类型声明文件
     */
    dtsBundle: DtsBundleOptions | boolean | null;
}
export interface DtsBundleOptions extends LibrariesOptions {
    /**
     * 入口文件
     */
    entry?: string | null;
}
/**
 * 使用 tsc 生成 类型声明文件
 * @param dest - 输出目录
 * @param options - 选项
 * @returns
 */
export declare function tsc_d_ts(dist: string, options?: Tsc_d_ts_Options | null): Promise<unknown>;
/**
 * 在退出之前执行
 * @returns
 */
export declare function onBeforeExit(): Promise<void>;
/**
 * 移除目标
 * @param path - 被移除的文件或文件夹的路径
 * @returns
 */
export declare function removePath(path: string): Promise<void>;
