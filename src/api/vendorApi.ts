import { createResourceApi } from './apiClient'
import type { Vendor } from './types'

export const vendorApi = createResourceApi<Vendor>('vendors')