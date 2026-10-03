import { createResourceApi } from './apiClient'
import type { Category } from './types'

export const categoryApi = createResourceApi<Category>('categories')