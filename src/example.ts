// 这是一个示例文件，用于测试 CLI Agent 的注释功能

/**
 * 计算两个数字的和
 * @param a 第一个加数（数值类型）
 * @param b 第二个加数（数值类型）
 * @returns 两个参数相加的结果（数值类型）
 */
function calculateSum(a: number, b: number) {
    return a + b;
}

/**
 * 计算两个数字的乘积
 * @param x 第一个乘数（数值类型）
 * @param y 第二个乘数（数值类型）
 * @returns 两个参数相乘的结果（数值类型）
 */
function calculateProduct(x: number, y: number) {
    return x * y;
}

/**
 * 计算器类，提供链式调用的加减运算功能
 * 该类维护一个内部状态值，支持连续的加法和减法操作，并可通过 getResult 获取最终结果
 */
class Calculator {
    private value: number; // 存储当前计算结果的私有属性

    /**
     * 构造函数，初始化计算器的起始值
     * @param initialValue 初始值，默认为 0
     */
    constructor(initialValue: number = 0) {
        this.value = initialValue;
    }

    /**
     * 执行加法操作：将指定数值加到当前值上
     * @param num 要添加的数值
     * @returns 返回当前实例（支持链式调用）
     */
    add(num: number) {
        this.value += num; // 更新内部状态值
        return this;
    }

    /**
     * 执行减法操作：从当前值中减去指定数值
     * @param num 要减去的数值
     * @returns 返回当前实例（支持链式调用）
     */
    subtract(num: number) {
        this.value -= num; // 更新内部状态值
        return this;
    }

    /**
     * 获取当前计算器的最终计算结果
     * @returns 当前存储的数值（即经过所有 add/subtract 操作后的结果）
     */
    getResult() {
        return this.value;
    }
}

export { calculateSum, calculateProduct, Calculator };