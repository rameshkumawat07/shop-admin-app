export type EntityId = string | number

export interface User {
  id: EntityId
  name: string
  email: string
  password: string
  role: string
}

export interface InventoryItem {
  id: EntityId
  name: string
  sku: string
  categoryId: EntityId
  vendorId: EntityId
  quantity: number
  purchasePrice: number
  sellingPrice: number
  description: string
  status: 'Active' | 'Inactive' | 'Low stock'
}

export interface Vendor {
  id: EntityId
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  gstNumber: string
}

export interface Category {
  id: EntityId
  name: string
  description: string
  status: 'Active' | 'Inactive'
}

export interface Order {
  id: EntityId
  orderNumber: string
  vendorId: EntityId
  date: string
  items: number
  total: number
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
}

export interface Sale {
  id: EntityId
  saleNumber: string
  productId: EntityId
  productName: string
  quantity: number
  unitPrice: number
  total: number
  date: string
  customer: string
}

export type CollectionName = 'inventory' | 'vendors' | 'categories' | 'orders' | 'sales'
export type Entity = InventoryItem | Vendor | Category | Order | Sale