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
export declare const copy_d_ts: typeof cp;
/**
 * generate_d_ts 的选项
 */
export interface Generate_D_TS_Options {
    /**
     * 是否拷贝项目中已有的 `.d.ts` 文件
     *
     * @defaultValue true
     */
    copyDTS?: boolean | null;
    /**
     * 传给 `tsc` 命令的选项
     *
     * @defaultValue ""
     */
    comArg?: string | null;
    /**
     * 是否要在当前进程将要退出时执行
     *
     * @defaultValue true
     */
    onExit?: boolean | null;
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
export declare function generate_d_ts(src: string, dest: string, options?: Generate_D_TS_Options | null): Promise<unknown>;
