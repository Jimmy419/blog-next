import CopyCode from "@/components/copyCode/CopyCode";

const Validator = async () => {
  const codeSnippets = [
    `
    import { mobileValidator } from '@jimmy-jin/js-tools';
    console.log(mobileValidator('13812345678')); // 输出: true
    `,
    `
    import { emailValidator } from '@jimmy-jin/js-tools';
    console.log(emailValidator('example@example.com')); // 输出: true
    `,
    `
    import { idNoZhValidator } from '@jimmy-jin/js-tools';
    console.log(idNoZhValidator('11010519491231002X')); // 输出: true
    `,
  ];
  return (
    <div className="bg-gray-100 text-gray-900 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-4">Validator Module</h1>
        <p className="mb-4">
          该模块提供了多种验证函数，包括身份证号验证、手机号码验证和邮箱验证。
        </p>

        <h2 className="text-2xl font-semibold mb-2">函数列表</h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            <a
              href="#mobileValidator"
              className="text-blue-500 hover:underline"
            >
              mobileValidator
            </a>
          </li>
          <li>
            <a href="#emailValidator" className="text-blue-500 hover:underline">
              emailValidator
            </a>
          </li>
          <li>
            <a
              href="#idNoZhValidator"
              className="text-blue-500 hover:underline"
            >
              idNoZhValidator
            </a>
          </li>
        </ul>

        <h3 id="mobileValidator" className="text-xl font-semibold mb-2">
          mobileValidator
        </h3>
        <p className="mb-2">
          手机号码验证函数，用于验证手机号码是否符合格式要求。
        </p>
        <h4 className="text-lg font-semibold mb-1">参数</h4>
        <ul className="list-disc list-inside mb-2">
          <li>
            <code>mobile</code> (string): 要验证的手机号码
          </li>
        </ul>
        <h4 className="text-lg font-semibold mb-1">返回值</h4>
        <p className="mb-2">
          <code>boolean</code>: 如果手机号码符合格式要求，返回 <code>true</code>
          ，否则返回 <code>false</code>
        </p>
        <h4 className="text-lg font-semibold mb-1">示例</h4>

        <CopyCode code={codeSnippets[0]} />

        <h3 id="emailValidator" className="text-xl font-semibold mb-2">
          emailValidator
        </h3>
        <p className="mb-2">邮箱验证函数，用于验证邮箱地址是否符合格式要求。</p>
        <h4 className="text-lg font-semibold mb-1">参数</h4>
        <ul className="list-disc list-inside mb-2">
          <li>
            <code>email</code> (string): 要验证的邮箱地址
          </li>
        </ul>
        <h4 className="text-lg font-semibold mb-1">返回值</h4>
        <p className="mb-2">
          <code>boolean</code>: 如果邮箱地址符合格式要求，返回 <code>true</code>
          ，否则返回 <code>false</code>
        </p>
        <h4 className="text-lg font-semibold mb-1">示例</h4>

        <CopyCode code={codeSnippets[1]} />

        <h3 id="idNoZhValidator" className="text-xl font-semibold mb-2">
          idNoZhValidator
        </h3>
        <p className="mb-2">
          身份证号验证函数，用于验证身份证号是否符合格式要求。
        </p>
        <h4 className="text-lg font-semibold mb-1">参数</h4>
        <ul className="list-disc list-inside mb-2">
          <li>
            <code>idCard</code> (string): 要验证的身份证号
          </li>
        </ul>
        <h4 className="text-lg font-semibold mb-1">返回值</h4>
        <p className="mb-2">
          <code>boolean</code>: 如果身份证号符合格式要求，返回 <code>true</code>
          ，否则返回 <code>false</code>
        </p>
        <h4 className="text-lg font-semibold mb-1">示例</h4>

        <CopyCode code={codeSnippets[2]} />

        <h2 className="text-2xl font-semibold mb-2">正则表达式</h2>
        <p className="mb-4">该模块使用以下正则表达式进行验证：</p>
        <ul className="list-disc list-inside mb-4">
          <li>
            <code>idCard</code>:{" "}
            <code>
              /^[1-9]\\d{5}(18|19|20)\\d{2}
              ((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$/
            </code>
          </li>
          <li>
            <code>mobile</code>: <code>/^1(3|4|5|6|7|8|9)\\d{9}/</code>
          </li>
          <li>
            <code>email</code>:{" "}
            <code>/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$/</code>
          </li>
        </ul>

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

export default Validator;
