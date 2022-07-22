/**
 * 大小写类型
 */
export declare enum CaseType {
    /**
     * 小写，
     * @remarks
     * 将会把所有字符都转为小写
     */
    L = "\u5C0F\u5199",
    /**
     * 大写 ，将会把所有字符都转为大写
     */
    U = "\u5927\u5199",
    /**
     * 正常，不做改变
     */
    N = "\u6B63\u5E38"
}
/**
 * 把字符串转换成分隔线的格式
 * @param str - 被转换的字符串
 * @param separator - 分隔线；默认值："-"
 * @param caseType -  大小写类型；只有当 separator 没指定时，才生效
 * @returns string
 */
export declare function toSeparatorLineFormat(str: string, separator?: string | null, caseType?: CaseType | null): string;
/**
* 首字母大写
*/
export declare function capFirstLetter(str: string): string;
