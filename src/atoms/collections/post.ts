import { produce } from 'immer'

import type { ModelWithLiked, PostModel } from '@mx-space/api-client'

import { apiClient } from '~/utils/client'

import { createCollection } from './utils/base'

interface IPostCollection {
  fetchBySlug(
    category: string,
    slug: string,
  ): Promise<ModelWithLiked<PostModel>>
}
export const usePostCollection = createCollection<PostModel, IPostCollection>(
  'post',
  (setState, getState) => {
    return {
      async fetchBySlug(category, slug) {
        const data = await apiClient.post.getPost(
          category,
          encodeURIComponent(slug),
        )
        setState(
          produce((state: ReturnType<typeof getState>) => {
            state.data.set(data.id, data)
          }),
        )
        return data
      },
    }
  },
)
