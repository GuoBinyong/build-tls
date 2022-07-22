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
 import {toSeparatorLineFormat,CaseType} from "./tools"

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
    copyDTS = finalOpts.outFile ? false : (copyDTS ?? true);
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
     * 传给 `tsc` 或 `dts-bundle-generator` 命令的选项
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


/**
 * dts-bundle-generator 的选项，详情请看{@link https://github.com/timocov/dts-bundle-generator}
 */
export interface DtsBundleOptions {
    /**
     * 入口文件
     */
    entry?:string| null;

    /**
     * Enable verbose logging
     * @defaultValue false
     */
    verbose?:boolean | null;
    /**
     * 禁用除错误之外的任何日志记录
     * @defaultValue false
     */
    silent?:boolean | null;

    /**
     * Skip validation of generated d.ts file
     * @defaultValue false
     */
    noCheck?:boolean | null;

    /**
     * 如果生成的 dts 包含类声明则失败
     * @defaultValue false
     */
    failOnClass?:boolean | null;


    /**
     * 从 node_modules 到内联类型的包名称数组。
     * @remarks
     * 使用的类型将内联到输出文件中。
     * 
     * @example
     * ```ts
     * ["type-tls","@gby/deepCopy"],
     * ```
     * 
     * @defaultValue []
     */
    externalInlines?:string[] |null;

    /**
     * 来自 node_modules 的包名称数组，用于从中导入类型。
     * @remarks
     * 使用的类型将使用 `import { First, Second } from 'library-name';` 导入。
     * 默认情况下，除了内联库和来自 `@types` 的库之外,其它所有库都将被导入的。
     * 
     * @example
     * ```ts
     * ["type-tls","@gby/deepCopy"],
     * ```
     * 
     * @defaultValue undefined
     */
    externalImports?:string[] |null;




    /**
     * 来自 `@types` 的包名称数组，用于通过三斜杠引用指令导入类型。
     * @remarks
     * 默认情况下，所有包都是允许的，并将根据它们的用途使用。
     * 
     * @example
     * ```ts
     * ["type-tls","@gby/deepCopy"],
     * ```
     * 
     * @defaultValue undefined
     */
     externalTypes?:string[] |null;


     /**
      * UMD 模块的名称
      * @remarks
      * 如果指定，则将输出 `export as namespace ModuleName;`
      * 
      * @defaultValue undefined
      */
     umdModuleName?:string | null;

     /**
      * 使用的 `tsconfig.json` 文件的路径
      */
     project?:string| null;


     /**
      * 按升序对输出节点进行排序。
      * 
      * @defaultValue false
      */
     sort?:boolean | null;


     /**
      * 启用应内联的文件（所有本地文件和内联库中的包）中包含的 `declare global` 语句的内联。
      * @default false
      */
     inlineDeclareGlobal?:boolean | null;

     /**
      * 启用全局模块的 `declare module` 语句的内联，包含在应该被内联的文件中（所有本地文件和来自内联库的包）
      * @remarks
      * 全局模块指的是 `declare module 'external-module' {}`，并不是 `declare module './internal-module' {}`
      * 
      * @defaultValue false
      */
     inlineDeclareExternals?:boolean | null;

     /**
      * 禁用将符号链接解析到原始路径。
      * 
      * @defaultValue false
      */
     disableSymlinksFollowing?:boolean | null;

     /**
      * 允许从每个直接导出的文件中剥离 `const` 关键字 或重新导出）从入口文件`const enum`
      * 
      * @defaultValue false
      */
     respectPreserveConstEnum?:boolean | null;

     /**
      * 默认情况下，所有 `interfaces`、`type` 和 `const enum` 都会被导出。 即使它们没有直接导出，也会导出。该选项允许您可以禁用此行为，以便将导出节点（如果它是）仅从根源文件导出。
      * 
      * @defaultValue true
      */
     exportReferencedTypes?:boolean | null;

     /**
      * dts-bundle-generator 的配置文件路径
      */
     config?:string | null;

     /**
      * 
      * 不在输出文件中生成 `Generated by dts-bundle-generator` 这样的注释
      * 
      * @defaultValue true
      */
     noBanner?:boolean | null;

     /**
      * 显示版本号
      */
     version?: boolean | null;
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
            const {entry,noBanner,...dtsBundleOpts} = (dtsBundle  || {}) as DtsBundleOptions;
            comd = `npx dts-bundle-generator  --out-file ${outFilePath}`;

            if (entry){
                comd += `  ${entry}`;
            }

            const banner = noBanner == null ? true : noBanner;

            if (banner){
                comd += "  --no-banner";
            }

            for (const [key,value] of Object.entries(dtsBundleOpts)){
                if (!value) continue;
                
                let comdOpts = toSeparatorLineFormat(key,"-",CaseType.L);
                comdOpts = `  --${comdOpts}`;

                const valueType = typeof value;

                if (Array.isArray(value)){
                    const comdOptArr = value.map(item=> `${comdOpts}  ${item}`);
                    comd += comdOptArr.join("");
                }else if (valueType === "string"){
                    comd += `${comdOpts}  ${value}`;
                }else {
                    comd += comdOpts;
                }
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
