import type { NextApiRequest, NextApiResponse } from "next";

let products = [
  {
    id: 1,
    name: "Áo hoodie",
    price: 250000,
    category: "Thời trang",
    imageUrl: "",
    createdAt: "2025-07-25",
  },
  {
    id: 2,
    name: "Tai nghe",
    price: 499000,
    category: "Điện tử",
    imageUrl: "",
    createdAt: "2025-07-22",
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const pid = Number(id);

  if (req.method === "GET") {
    const product = products.find((p) => p.id === pid);
    res.status(200).json(product || null);
  } else if (req.method === "PUT") {
    const index = products.findIndex((p) => p.id === pid);
    if (index !== -1) {
      products[index] = { ...products[index], ...req.body };
      res.status(200).json({ message: "Updated", product: products[index] });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } else {
    res.status(405).end();
  }
}
