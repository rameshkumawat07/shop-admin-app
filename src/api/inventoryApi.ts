import { createResourceApi } from './apiClient'
import type { InventoryItem } from './types'

export const inventoryApi = createResourceApi<InventoryItem>('inventory')