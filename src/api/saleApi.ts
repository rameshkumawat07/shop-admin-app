import { createResourceApi } from './apiClient'
import type { Sale } from './types'

export const saleApi = createResourceApi<Sale>('sales')