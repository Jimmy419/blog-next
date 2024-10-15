import { redirect } from "next/navigation";

const JTool = async () => {
  redirect("/jtool/calculator");

  return <div>This is Jtool documents</div>;
};

export default JTool;
