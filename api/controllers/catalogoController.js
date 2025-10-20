import { db } from "../config/bd.js";

export const obtenerProductos = async (req, res) => {
  try {
    const [resultados] = await db.query("SELECT * FROM perfumes");
    res.json(resultados);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};
