import CopyCode from "@/components/copyCode/CopyCode";

const Calculator = async () => {
  const codeSnippets = [
    `
    import {accAdd} from '@jimmy-jin/js-tools'; 
    console.log(accAdd(0.1, 0.2)); // 输出: 0.3
    `,
    `
    import { accMinus } from '@jimmy-jin/js-tools';
    console.log(accMinus(0.3, 0.1)); // 输出: 0.2
    `,
    `
    import {accMultiply} from '@jimmy-jin/js-tools';
    console.log(accMultiply(0.1, 0.2)); // 输出: 0.02
    `,
    `
    import {accDivide} from '@jimmy-jin/js-tools'; 
    console.log(accDivide(0.3, 0.1)); // 输出: 3
    `,
  ];
  return (
    <div>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Calculator Module</h1>
        <p className="mb-4">
          该模块提供了四个用于精确计算的函数：加法、减法、乘法和除法。这些函数可以避免
          JavaScript 中浮点数运算的精度问题。
        </p>

        <h2 className="text-2xl font-semibold mb-2">函数列表</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            <a href="#accAdd" className="text-blue-500 hover:underline">
              accAdd
            </a>
          </li>
          <li>
            <a href="#accMinus" className="text-blue-500 hover:underline">
              accMinus
            </a>
          </li>
          <li>
            <a href="#accMultiply" className="text-blue-500 hover:underline">
              accMultiply
            </a>
          </li>
          <li>
            <a href="#accDivide" className="text-blue-500 hover:underline">
              accDivide
            </a>
          </li>
        </ul>

        <h3 id="accAdd" className="text-xl font-semibold mb-2">
          accAdd
        </h3>
        <p className="mb-2">精确加法函数，用于两个浮点数的加法运算。</p>
        <h4 className="text-lg font-semibold mb-1">参数</h4>
        <ul className="list-disc list-inside mb-2">
          <li>
            <code>arg1</code> (number): 第一个加数
          </li>
          <li>
            <code>arg2</code> (number): 第二个加数
          </li>
        </ul>
        <h4 className="text-lg font-semibold mb-1">返回值</h4>
        <p className="mb-2">
          <code>number</code>: 两个数的和
        </p>
        <h4 className="text-lg font-semibold mb-1">示例</h4>

        <CopyCode code={codeSnippets[0]} />

        <h3 id="accMinus" className="text-xl font-semibold mb-2">
          accMinus
        </h3>
        <p className="mb-2">精确减法函数，用于两个浮点数的减法运算。</p>
        <h4 className="text-lg font-semibold mb-1">参数</h4>
        <ul className="list-disc list-inside mb-2">
          <li>
            <code>arg1</code> (number): 被减数
          </li>
          <li>
            <code>arg2</code> (number): 减数
          </li>
        </ul>
        <h4 className="text-lg font-semibold mb-1">返回值</h4>
        <p className="mb-2">
          <code>number</code>: 两个数的差
        </p>
        <h4 className="text-lg font-semibold mb-1">示例</h4>

        <CopyCode code={codeSnippets[1]} />

        <h3 id="accMultiply" className="text-xl font-semibold mb-2">
          accMultiply
        </h3>
        <p className="mb-2">精确乘法函数，用于两个浮点数的乘法运算。</p>
        <h4 className="text-lg font-semibold mb-1">参数</h4>
        <ul className="list-disc list-inside mb-2">
          <li>
            <code>number1</code> (number): 第一个乘数
          </li>
          <li>
            <code>number2</code> (number): 第二个乘数
          </li>
        </ul>
        <h4 className="text-lg font-semibold mb-1">返回值</h4>
        <p className="mb-2">
          <code>number</code>: 两个数的积
        </p>
        <h4 className="text-lg font-semibold mb-1">示例</h4>

        <CopyCode code={codeSnippets[2]} />

        <h3 id="accDivide" className="text-xl font-semibold mb-2">
          accDivide
        </h3>
        <p className="mb-2">精确除法函数，用于两个浮点数的除法运算。</p>
        <h4 className="text-lg font-semibold mb-1">参数</h4>
        <ul className="list-disc list-inside mb-2">
          <li>
            <code>num1</code> (number): 被除数
          </li>
          <li>
            <code>num2</code> (number): 除数
          </li>
        </ul>
        <h4 className="text-lg font-semibold mb-1">返回值</h4>
        <p className="mb-2">
          <code>number</code>: 两个数的商
        </p>
        <h4 className="text-lg font-semibold mb-1">示例</h4>

        <CopyCode code={codeSnippets[3]} />

        <h2 className="text-2xl font-semibold mb-2">错误处理</h2>
        <p className="mb-4">
          每个函数在处理浮点数的小数位数时，都会捕获可能的异常并输出错误信息到控制台。
        </p>

        <h2 className="text-2xl font-semibold mb-2">依赖</h2>
        <p className="mb-4">无外部依赖。</p>

        <h2 className="text-2xl font-semibold mb-2">贡献</h2>
        <p className="mb-4">欢迎提交问题和贡献代码。</p>

        <h2 className="text-2xl font-semibold mb-2">许可证</h2>
        <p className="mb-4">此项目基于 MIT 许可证。</p>
      </div>
    </div>
  );
};

export default Calculator;
