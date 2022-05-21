import { TrackerAction } from 'constants/tracker'
import { useAnalyze } from 'hooks/use-analyze'
import { noop } from 'lodash-es'
import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'
import { FC } from 'react'
import { useStore } from 'store'
import { springScrollToTop } from 'utils/spring'

import { NoteModel } from '@mx-space/api-client'

export const NoteFooterNavigation: FC<{ id: string }> = observer(({ id }) => {
  const { noteStore } = useStore()
  const [prev, next] =
    noteStore.relationMap.get(id) ||
    ([noop, noop] as [Partial<NoteModel>, Partial<NoteModel>])
  const router = useRouter()
  const { event } = useAnalyze()
  return (
    <>
      {(!!next || !!prev) && (
        <section className="kami-more">
          {!!next && (
            <button
              className="btn green"
              onClick={() => {
                router.push('/notes/[id]', `/notes/${next.nid}`)
              }}
            >
              前一篇
            </button>
          )}
          {
            <button
              className="btn yellow"
              onClick={() => {
                const note = noteStore.get(id)

                event({
                  action: TrackerAction.NoteToTimeline,
                  label: `Note Id ${note?.nid} ${note?.title}`,
                })

                springScrollToTop()
                router.push('/timeline?type=note')
              }}
            >
              时间线
            </button>
          }
          {!!prev && (
            <button
              className="btn green"
              onClick={() => {
                router.push('/notes/[id]', `/notes/${prev.nid}`)
              }}
            >
              后一篇
            </button>
          )}
        </section>
      )}
    </>
  )
})
