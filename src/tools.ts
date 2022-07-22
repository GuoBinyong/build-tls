/**
 * 大小写类型
 */
export enum CaseType {
    /**
     * 小写，
     * @remarks
     * 将会把所有字符都转为小写
     */
    L = "小写", 
    /**
     * 大写 ，将会把所有字符都转为大写
     */
    U = "大写",
    /**
     * 正常，不做改变
     */
    N = "正常",
}

/**
 * 把字符串转换成分隔线的格式
 * @param str - 被转换的字符串
 * @param separator - 分隔线；默认值："-" 
 * @param caseType -  大小写类型；只有当 separator 没指定时，才生效
 * @returns string
 */
export function toSeparatorLineFormat(str: string, separator?: string | null, caseType?: CaseType | null) {

    if (separator == undefined) {
        separator = "-";
    }

    if (caseType == undefined) {
        caseType = CaseType.N;
    }

    var lowerCase = caseType === CaseType.L;

    var targetStr = str.replace(/[A-Z]+/g, function (match) {
        var matchStr = lowerCase ? match.toLowerCase() : match;
        return separator + matchStr;
    });

    var errorSeparatorRexStr = "(^\\s*)" + separator + "+";
    var errorSeparatorRex = new RegExp(errorSeparatorRexStr);
    targetStr = targetStr.replace(errorSeparatorRex, "$1");  //如果首字母是大写，执行replace时会多一个_，这里需要去掉

    if (caseType == CaseType.U) {
        targetStr = capFirstLetter(targetStr);
    }

    return targetStr;
}




/**
* 首字母大写
*/
export function capFirstLetter(str: string) {
    return str.replace(/(^\W*)(\w)/, function (match, p1, p2) {
        return p1 + p2.toUpperCase();
    });
}