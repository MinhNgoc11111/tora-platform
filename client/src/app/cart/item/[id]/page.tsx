'use client';

import { useParams } from 'next/navigation';

const mockItems = [
  {
    id: 1,
    name: "Sản phẩm nổi bật 1",
    imageUrl: "https://via.placeholder.com/200",
    price: 417000,
    quantity: 1,
    color: "Đen",
    size: "M",
  },
];

export default function CartItemDetail() {
  const rawId = useParams()?.id;
  const id = Array.isArray(rawId) ? parseInt(rawId[0]) : parseInt(rawId || "");

  if (isNaN(id)) return <p className="p-4 text-red-500">ID không hợp lệ.</p>;

  const item = mockItems.find(i => i.id === id);

  if (!item) return <p className="p-4 text-red-500">Không tìm thấy sản phẩm.</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">{item.name}</h2>
      <img src={item.imageUrl} alt={item.name} className="w-40 h-40 object-cover mb-4" />
      <p><strong>Giá:</strong> {item.price.toLocaleString()}đ</p>
      <p><strong>Số lượng:</strong> {item.quantity}</p>
      <p><strong>Màu sắc:</strong> {item.color}</p>
      <p><strong>Kích thước:</strong> {item.size}</p>
    </div>
  );
}
