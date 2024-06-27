import { IProductDataSet } from "@/constants"

export async function getCategory(gender:string, type:string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}categories?gender=${gender}&type=${type}`, {
      method: 'GET',
      next: {revalidate: 1}
    })
    const data = await res.json()
    return data
  }

export async function createCategory(dataSet: {gender: string, type: string, category: string}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}categories`, {
    method: "POST",
    headers: {
        "content-Type": "application/json"
    },
    body: JSON.stringify(dataSet)
  })
  const data = await res.json()
  return data
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}categories/${id}`, {
    method: "DELETE"
  })
  const data = await res.json()
  return data
}

export async function getCategorySlug(gender:string, type:string, slug:string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}categories/${slug}?gender=${gender}&type=${type}`, {
    method: 'GET',
  })
  const data = await res.json()
  return data
}

export async function getProductName(n?:string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}products/names?n=${n}`, {
    method: 'GET',
  })
  const data = await res.json()
  return data
}

export async function getCatalog(g?:string, t?:string, c?:string, q?:string, s?:string, p?:string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}products/catalogs?g=${g}&t=${t}&c=${c}&q=${q}&s=${s}&p=${p}`, {
    method: 'GET',
  })
  const data = await res.json()
  return data

}

export async function editCategory(dataSet: {gender: string, type: string, category: string, newCategory: string}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}categories`, {
    method: "PATCH",
    headers: {
      "content-Type": "application/json"
    },
    body: JSON.stringify(dataSet)
  })
  const data = await res.json()
  return data
}

export async function getWarehouse(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}warehouses/${id}`, {
    method: "GET"
  })
  const data = await res.json()
  return data
}

export async function createProduct(dataSet:IProductDataSet) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}products`, {
    method: "POST",
    headers: {
      "content-Type": "application/json"
    },
    body: JSON.stringify(dataSet)
  })
  const data = await res.json()
  return data
}

export async function getProduct(warehouse?:string, p?:number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}products?w=${warehouse}&p=${p}`, {
    method: 'GET',
    next: {revalidate: 1}
  })
  const data = await res.json()
  return data
}

export async function getProductSlug(slug:string, warehouse?:string, size?: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}products/${slug}?w=${warehouse}&s=${size}`, {
    method: 'GET',
    next: {revalidate: 1}
  })
  const data = await res.json()
  return data
}

export async function editProduct(dataSet:any, slug:string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}products/${slug}`, {
    method: "PATCH",
    headers: {
      "content-Type": "application/json"
    },
    body: JSON.stringify(dataSet)
  })
  const data = await res.json()
  return data
}

export async function deleteProduct(slug:string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}products/${slug}`, {
    method: "DELETE",
  })
  const data = await res.json()
  return data
}

export async function changeStock(dataSet:any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}stocks`, {
    method: "POST",
    headers: {
      "content-Type": "application/json"
    },
    body: JSON.stringify(dataSet)
  })
  const data = await res.json()
  return data
}
