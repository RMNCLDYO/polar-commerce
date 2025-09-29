export interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  description: string;
}

export async function getProducts(): Promise<Product[]> {
  return [
    {
      id: "1",
      name: "Nike ZoomX Vomero Plus",
      price: "$180",
      category: "RUNNING SHOES",
      image: "/products/nike-vomero.jpeg",
      description: "Premium running shoes with ZoomX foam technology",
    },
    {
      id: "2",
      name: "Nike Club Cap",
      price: "$25",
      category: "ACCESSORIES",
      image: "/products/nike-cap.jpeg",
      description: "Classic baseball cap with Nike logo",
    },
    {
      id: "3",
      name: "Nike Tech Woven Pants",
      price: "$120",
      category: "MEN'S PANTS",
      image: "/products/nike-tech-set.jpeg",
      description: "Camo tracksuit with modern tech fabric",
    },
    {
      id: "4",
      name: "Jordan Fleece Hoodie",
      price: "$85",
      category: "MEN'S HOODIE",
      image: "/products/jordan-hoodie.jpeg",
      description: "Premium hoodie with signature graphics",
    },
  ];
}

export async function getProduct(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}
