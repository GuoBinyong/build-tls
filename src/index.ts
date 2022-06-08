/**
 * 专门用于构建的相关工具
 * 
 * @remarks
 * 本库封装了前端构建时常用的工具、函数等
 * 
 * @packageDocumentation
 */


 import {cp} from "node:fs/promises"
 import {extname} from "node:path"
 
 
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


 

import {exec} from "node:child_process";
import process from "node:process"


/**
 * generate_d_ts 的选项
 */
export interface Generate_D_TS_Options {

    /**
     * 是否拷贝项目中已有的 `.d.ts` 文件
     */
    copyDTS?:boolean|null;

    /**
     * 传给 `tsc` 命令的选项
     */
    comArg?:string|null;

    /**
     * 是否要在当前进程将要退出时执行
     * 
     * @defaultValue true
     */
    onExit?:boolean|null;
}


/**
 * 生成 TypeScript 类型声明文件
 * @remarks
 * 通过 tsc 命令生成 TypeScript 类型声明文件，并且可以拷贝 源目录下的  `.d.ts` 文件到输出目录中。
 * 
 * 注意：tsc 命令本身不会拷贝项目中已有的 `.d.ts` 文件。
 * 
 * @param src - 源目录
 * @param dest - 存放生成的 `.d.ts` 的输出目录
 * @param options - 选项
 * @returns 操作完成的 Promise
 */
export function generate_d_ts(src:string,dest:string,options?:Generate_D_TS_Options|null){
    const {copyDTS,comArg,onExit = true} = options ?? {};
    const comArgStr = comArg || "";

    function generate(){
        let copyPro = Promise.resolve();
        if (copyDTS){
            copyPro =  copy_d_ts(src,dest);
        }
    
        const tscPro = new Promise((resolve, reject) =>{
            exec(`npx tsc --emitDeclarationOnly --outDir ${dest} ${comArgStr}`,function(err,stdout,stderr){
                if (err) {
                    console.error(stderr);
                    reject(err);
                }else{
                    console.log(stdout);
                    resolve(stdout);
                }
            });
        });
    
       return Promise.all([copyPro,tscPro]);
    }


    if (onExit){
       return new Promise(function (resolve){
            process.on("beforeExit",()=>{
                if ((process as any).hasGenerated_d_ts){
                    return resolve(null);
                }
                resolve(generate());
                (process as any).hasGenerated_d_ts = true;
            });
        });

    }else{
        return generate();
    }

  
}