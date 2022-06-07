/**
 * 专门用于构建的相关工具
 * 
 * @remarks
 * 本库封装了前端构建时常用的工具、函数等
 * 
 * @packageDocumentation
 */


 import {cp} from "fs/promises"
 import {extname} from "path"
 
 
 /**
  * TypeScript类型声明文件的过滤函数
  * @param path - 文件路径
  * @internal
  */
 function d_ts_filter(path: string) {
     return /.d.ts$/.test(path) || extname(path).length === 0
 }
 
 
 /**
  * 拷贝 TypeScript 的类型声明文件
  * @remarks
  * 将 源目录 中 TypeScript 类型声明文件 拷贝到 目标目录下
  * 
  * @param src - 源目录
  * @param dest - 目标目录
  * @param options - 选项
  */
 export const copy_d_ts:typeof cp = function copyTSDeclarationFiles(src,dest,options) {
     return cp(src,dest,{
         recursive:true,
         force:true,
         filter:d_ts_filter,
         ...options
     });
 }