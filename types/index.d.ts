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
 * 将 源目录 中 TypeScript 类型声明文件 拷贝到 目标目录下
 *
 * @param src - 源目录
 * @param dest - 目标目录
 * @param options - 选项
 */
export declare const copy_d_ts: typeof cp;
