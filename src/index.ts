/**
 * 专门用于构建的相关工具
 * 
 * @remarks
 * 本库封装了前端构建时常用的工具、函数等
 * 
 * @packageDocumentation
 */


 import {cp,rm} from "node:fs/promises"
 import {extname,join} from "node:path"
 import type {LibrariesOptions,OutputOptions,CompilationOptions} from "dts-bundle-generator"

 const logPrefix = "build-tls"; //日志前缀

 
 /**
  * TypeScript类型声明文件的过滤函数
  * @param path - 文件路径
  * @internal
  */
 function d_ts_filter(path: string) {
     return /\.d\.ts$/.test(path) || extname(path).length === 0;
 }
 

 export type CopyOptions = NonNullable<Parameters<typeof cp>[2]> & {
    /**
     * 需要排除的文件或目录名字
     * 
     * @remarks
     * 如果 指定了 filter 选项，则 exclude 无效
     */
    exclude?:string[]|null
}
 
 
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
 export function copy_d_ts(src:string,dest:string,options?:CopyOptions) {
    const exclude = options?.exclude || [];
    console.log(`${logPrefix}: 开始拷贝 .d.ts 文件`);
     return cp(src,dest,{
         recursive:true,
         force:true,
         filter:function(path){
            const isEsclude = exclude.some(function(exc){
                return path.endsWith(exc);
            });

            if (isEsclude) return false;
           return  d_ts_filter.call(this,path);
         },
         ...options
     }).then(function(result){
        console.log(`${logPrefix}: .d.ts 文件拷贝完成`);
        return result;
    },function(err){
        console.error(`${logPrefix}: .d.ts 文件拷贝出错`,err);
        throw err;
    });
 }


 

import {exec} from "node:child_process";
import process from "node:process"


/**
 * generate_d_ts 的选项
 */
export interface Generate_D_TS_Options extends Tsc_d_ts_Options {
    /**
     * 是否拷贝项目中已有的 `.d.ts` 文件
     * 
     * @defaultValue true
     */
    copyDTS?:boolean|null|CopyOptions;


    /**
     * 是否要在当前进程将要退出时执行
     * 
     * @defaultValue true
     */
    onExit?:boolean|null;
    /**
     * 是否清空输出目录
     */
    emptyOutDir?:boolean|null;
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
export function generate_d_ts(src:string,dest:string,options?:Generate_D_TS_Options|null){
    const finalOpts = {...options} as Generate_D_TS_Options;
    let {copyDTS,onExit} = finalOpts;
    copyDTS = copyDTS ?? true;
    onExit = onExit ?? true;
    const {emptyOutDir,dtsBundle} = finalOpts;
    if (dtsBundle){
        const dtsBundleOpts = typeof dtsBundle === 'object' ? {...dtsBundle} : {} as DtsBundleOptions;
        dtsBundleOpts.entry = dtsBundleOpts.entry ?? join(src,"index.ts");
        finalOpts.dtsBundle = dtsBundleOpts;
    }
    async function generate(){
        if (emptyOutDir){
            await removePath(dest);
        }

        const allPro = [];
        if (copyDTS){
            const copyOpts = typeof copyDTS === "object" ? copyDTS : {};
            allPro.push( copy_d_ts(src,dest,copyOpts) );
        }

        allPro.push(tsc_d_ts(dest,finalOpts));    
        return Promise.all(allPro);
    }


    if (onExit){
        return onBeforeExit().then(generate);
    }else{
        return generate();
    }

}

/**
 * tsc_d_ts 的选项
 */
export interface Tsc_d_ts_Options {
    /**
     * 作为单一输出文件的名字
     * @remarks
     * 会放在输出目录下
     */
    outFile?:string|boolean|null;

    /**
     * 传给 `tsc` 命令的选项
     * 
     * @defaultValue ""
     */
     comArg?:string|null;


     /**
      * dtsBundle 额外选项
      * 
      * @remarks
      * 当此选项为真值时，会使用 dts-bundle-generator 来生成单个的类型声明文件
      */
     dtsBundle:DtsBundleOptions|boolean|null;
}


export interface DtsBundleOptions extends LibrariesOptions,OutputOptions,CompilationOptions{
    /**
     * 入口文件
     */
    entry?:string| null,
}


/**
 * 使用 tsc 生成 类型声明文件
 * @param dest - 输出目录或文件的路径，优先级低于 options.outFile 
 * @param options - 选项
 * @returns 
 */
export function tsc_d_ts(dist:string,options?:Tsc_d_ts_Options|null){
    const {outFile,comArg,dtsBundle} = options ?? {};

    let comd = "npx tsc --emitDeclarationOnly";
    
    if (outFile){
        let outFilePath = outFile as string;
        if (typeof outFile !== 'string'){
            outFilePath = extname(dist).length === 0 ? join(dist,"index.d.ts") : dist;
        }


        if (dtsBundle){
            const {entry: entity,inlinedLibraries,importedLibraries,allowedTypesLibraries} = (dtsBundle  || {}) as DtsBundleOptions;
            comd = `npx dts-bundle-generator  --no-banner  --out-file ${outFilePath}`;

            if (entity){
                comd += `  ${entity}`;
            }

            

            if (inlinedLibraries && inlinedLibraries.length > 0){
                const inlineArgs = inlinedLibraries!.map(lib=> `  --external-inlines ${lib}`);
                comd += inlineArgs.join(" ");
            }

            if (importedLibraries && importedLibraries.length > 0){
                const inlineArgs = importedLibraries!.map(lib=> `  --external-imports ${lib}`);
                comd += inlineArgs.join(" ");
            }

            if (allowedTypesLibraries && allowedTypesLibraries.length > 0){
                const inlineArgs = allowedTypesLibraries!.map(lib=> `  --external-types ${lib}`);
                comd += inlineArgs.join(" ");
            }

        }else{
            comd += `  --outFile ${outFilePath}`;
        }
    }else{
        comd += `  --declarationDir ${dist}`;
    }

    if (comArg){
        comd += `  ${comArg}`;
    }


    return new Promise((resolve, reject) =>{
        
        console.log(`${logPrefix}: 执行命令：${comd}`);
        exec(comd,function(err,stdout,stderr){
            console.log(`${logPrefix}: 命令已结束：${comd}`);
            if (err) {
                console.error(`${logPrefix}: 错误: ${stderr}`);
                console.error(stdout);
                reject(err);
            }else{
                console.log(`${logPrefix}: 完成: `,stdout);
                resolve(stdout);
            }
        });
    });
}




/**
 * 在退出之前执行
 * @returns 
 */
export function onBeforeExit(){
    return new Promise<void>(function (resolve){
        const listener = ()=>{
            process.off("beforeExit",listener);
            resolve();
        };
        process.on("beforeExit",listener);
    });
}






/**
 * 移除目标
 * @param path - 被移除的文件或文件夹的路径
 * @returns 
 */
export function removePath(path:string) {
    return rm(path,{force:true,recursive:true});
}
