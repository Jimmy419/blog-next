import CopyCode from "@/components/copyCode/CopyCode";

const Formatter = async () => {
  const codeSnippets = [
    `
    import { currencyFormater } from '@jimmy-jin/js-tools';
    console.log(currencyFormater(1234567.89, '$')); // 输出: $ 1,234,567.89`,
    `
    import { dateFormater } from '@jimmy-jin/js-tools';
    console.log(dateFormater('2023-10-01', 'YYYY-mm-dd')); // 输出: 2023-10-01
    `,
    `
    import { mobileFormater } from '@jimmy-jin/js-tools';
    console.log(mobileFormater('13812345678')); // 输出: 138****5678
    `,
    `
    import { nameFormater } from '@jimmy-jin/js-tools';
    console.log(nameFormater('张三')); // 输出: 张*
    `,
  ];

  return (
    <div className="bg-gray-100 text-gray-900 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-4">Formatter Module</h1>
        <p className="mb-4">
          该模块提供了多种格式化函数，包括货币格式化、日期格式化、手机号码安全格式化和姓名安全格式化。
        </p>

        <h2 className="text-2xl font-semibold mb-2">函数列表</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            <a
              href="#currencyFormater"
              className="text-blue-500 hover:underline"
            >
              currencyFormater
            </a>
          </li>
          <li>
            <a href="#dateFormater" className="text-blue-500 hover:underline">
              dateFormater
            </a>
          </li>
          <li>
            <a href="#mobileFormater" className="text-blue-500 hover:underline">
              mobileFormater
            </a>
          </li>
          <li>
            <a href="#nameFormater" className="text-blue-500 hover:underline">
              nameFormater
            </a>
          </li>
        </ul>

        <h3 id="currencyFormater" className="text-xl font-semibold mb-2">
          currencyFormater
        </h3>
        <p className="mb-2">
          货币格式化函数，用于将数字格式化为带有货币符号和千分位分隔符的字符串。
        </p>
        <h4 className="text-lg font-semibold mb-1">参数</h4>
        <ul className="list-disc list-inside mb-2">
          <li>
            <code>num</code> (number): 要格式化的数字
          </li>
          <li>
            <code>symbo</code> (string): 货币符号
          </li>
        </ul>
        <h4 className="text-lg font-semibold mb-1">返回值</h4>
        <p className="mb-2">
          <code>string</code>: 格式化后的货币字符串
        </p>
        <h4 className="text-lg font-semibold mb-1">示例</h4>
        <pre className="bg-gray-200 p-2 rounded mb-4">
          <CopyCode code={codeSnippets[0]} />
        </pre>

        <h3 id="dateFormater" className="text-xl font-semibold mb-2">
          dateFormater
        </h3>
        <p className="mb-2">
          日期格式化函数，用于将日期格式化为指定格式的字符串。
        </p>
        <h4 className="text-lg font-semibold mb-1">参数</h4>
        <ul className="list-disc list-inside mb-2">
          <li>
            <code>dateIpt</code> (string | Date): 要格式化的日期
          </li>
          <li>
            <code>fmt</code> (string): 格式化字符串
          </li>
        </ul>
        <h4 className="text-lg font-semibold mb-1">返回值</h4>
        <p className="mb-2">
          <code>string</code>: 格式化后的日期字符串
        </p>
        <h4 className="text-lg font-semibold mb-1">示例</h4>
        <pre className="bg-gray-200 p-2 rounded mb-4">
          <CopyCode code={codeSnippets[1]} />
        </pre>

        <h3 id="mobileFormater" className="text-xl font-semibold mb-2">
          mobileFormater
        </h3>
        <p className="mb-2">
          手机号码安全格式化函数，用于将手机号码中间四位替换为星号。
        </p>
        <h4 className="text-lg font-semibold mb-1">参数</h4>
        <ul className="list-disc list-inside mb-2">
          <li>
            <code>name</code> (string): 要格式化的手机号码
          </li>
        </ul>
        <h4 className="text-lg font-semibold mb-1">返回值</h4>
        <p className="mb-2">
          <code>string | null</code>:
          格式化后的手机号码字符串，如果输入为空则返回 null
        </p>
        <h4 className="text-lg font-semibold mb-1">示例</h4>
        <pre className="bg-gray-200 p-2 rounded mb-4">
          <CopyCode code={codeSnippets[2]} />
        </pre>

        <h3 id="nameFormater" className="text-xl font-semibold mb-2">
          nameFormater
        </h3>
        <p className="mb-2">
          姓名安全格式化函数，用于将姓名的第二个字符替换为星号。
        </p>
        <h4 className="text-lg font-semibold mb-1">参数</h4>
        <ul className="list-disc list-inside mb-2">
          <li>
            <code>name</code> (string): 要格式化的姓名
          </li>
        </ul>
        <h4 className="text-lg font-semibold mb-1">返回值</h4>
        <p className="mb-2">
          <code>string | null</code>: 格式化后的姓名字符串，如果输入为空则返回
          null
        </p>
        <h4 className="text-lg font-semibold mb-1">示例</h4>
        <pre className="bg-gray-200 p-2 rounded mb-4">
          <CopyCode code={codeSnippets[3]} />
        </pre>

        <h2 className="text-2xl font-semibold mb-2">错误处理</h2>
        <p className="mb-4">
          每个函数在处理输入时，都会进行必要的检查和处理，以确保格式化结果的正确性。
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

export default Formatter;
