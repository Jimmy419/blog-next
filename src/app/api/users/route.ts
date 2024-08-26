// pages/api/users.js
import { NextApiRequest, NextApiResponse } from "next";
import { createConnection } from "@/lib/db";

export async function GET(
  req: NextApiRequest
) {
  const connection = await createConnection();

  try {
    const [rows] = await connection.execute("SELECT * FROM auth");
    // res.status(200).json(rows);
    return new Response(JSON.stringify(rows), {
      status: 200,
    });
  } catch (error) {
    // res.status(500).json({ error: "Failed to fetch data" });
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
    });
  } finally {
    await connection.end();
  }
}
// export async function GET(request) {  

// }  
