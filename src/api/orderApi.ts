import { createResourceApi } from './apiClient'
import type { Order } from './types'

export const orderApi = createResourceApi<Order>('orders')