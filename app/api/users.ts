// pages/api/users.js
import { createConnection } from "../lib/db";

export default async function handler(req, res) {
  console.log("req", req);
  const connection = await createConnection();

  try {
    const [rows] = await connection.execute("SELECT * FROM auth");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  } finally {
    await connection.end();
  }
}
