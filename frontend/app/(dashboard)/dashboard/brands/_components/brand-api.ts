const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3009";

export interface Brand {
  id: number;
  name: Record<string, string> | null;
  description: Record<string, string> | null;
  slug: string | null;
  logo: string | null;
  active: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export async function getBrands(): Promise<Brand[]> {
  const res = await fetch(`${API_URL}/brands`);
  if (!res.ok) throw new Error("Failed to fetch brands");
  return res.json();
}

export async function getBrand(id: number): Promise<Brand> {
  const res = await fetch(`${API_URL}/brands/${id}`);
  if (!res.ok) throw new Error("Failed to fetch brand");
  return res.json();
}

export async function getBrandBySlug(slug: string): Promise<Brand> {
  const res = await fetch(`${API_URL}/brands/by-slug/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch brand");
  return res.json();
}

export async function createBrand(data: Record<string, unknown>): Promise<Brand> {
  const res = await fetch(`${API_URL}/brands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create brand");
  return res.json();
}

export async function updateBrand(id: number, data: Record<string, unknown>): Promise<Brand> {
  const res = await fetch(`${API_URL}/brands/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update brand");
  return res.json();
}

export async function deleteBrand(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/brands/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete brand");
}
