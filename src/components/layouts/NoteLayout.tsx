import clsx from 'clsx'
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { forwardRef, useCallback } from 'react'
import { Collapse } from 'react-collapse'
import { shallow } from 'zustand/shallow'

import type { NoteModel } from '@mx-space/api-client'

import { useAppStore } from '~/atoms/app'
import { useNoteCollection } from '~/atoms/collections/note'
import { useIsLogged } from '~/atoms/user'
import { FloatPopover } from '~/components/ui/FloatPopover'
import { SolidBookmark } from '~/components/ui/Icons/for-note'
import {
  FluentEyeHide20Regular,
  RegularBookmark,
} from '~/components/ui/Icons/layout'
import { BottomToUpTransitionView } from '~/components/ui/Transition/bottom-up'
import { apiClient } from '~/utils/client'
import { resolveUrl } from '~/utils/utils'

import { ClientOnly } from '../app/ClientOnly'
import { IconTransition } from '../common/IconTransition'
import { Banner } from '../ui/Banner'

const NoteTimelineList = dynamic(() =>
  import('~/components/in-page/Note/NoteTimelineList').then(
    (mo) => mo.NoteTimelineList,
  ),
)

const bannerClassNames = {
  info: `bg-sky-50 dark:bg-sky-800 dark:text-white`,
  warning: `bg-orange-100 dark:bg-orange-800 dark:text-white`,
  error: `bg-rose-100 dark:bg-rose-800 dark:text-white`,
  success: `bg-emerald-100 dark:bg-emerald-800 dark:text-white`,
  secondary: `bg-sky-100 dark:bg-sky-800 dark:text-white`,
}
const useNoteMetaBanner = (note?: NoteModel) => {
  if (!note) {
    return
  }
  const meta = note?.meta
  let banner = meta?.banner as {
    type: string
    message: string
    className: string
    style?: any
  }

  if (!banner) {
    return
  }
  if (typeof banner === 'string') {
    return {
      type: 'info',
      message: banner,
      className: bannerClassNames.info,
    }
  }
  banner = { ...banner }
  banner.type ??= 'info'
  banner.className ??= bannerClassNames[banner.type]

  return banner
}

interface NoteLayoutProps {
  title: string
  tips?: string
  date: string

  id: string
  children?: ReactNode

  isPreview?: boolean
}

export const NoteLayout = forwardRef<HTMLElement, NoteLayoutProps>(
  (props, ref) => {
    const { date, id, title, tips, children, isPreview = false } = props
    // autocorrect: false
    const dateFormat = dayjs(date).locale('cn').format('YYYY年M月D日 dddd')
    // autocorrect: true
    const isLogged = useIsLogged()

    const url = useAppStore((state) => state.appUrl)

    const note = useNoteCollection((state) => state.get(id), shallow)
    const bookmark = note?.hasMemory
    const banner = useNoteMetaBanner(note)
    const onMarkToggle = useCallback(async () => {
      await apiClient.note.proxy(id).patch({ data: { hasMemory: !bookmark } })
    }, [bookmark, id])
    const noAppear = globalThis.location ? location.hash : false
    return (
      <main className="is-note relative max-w-[50em]" ref={ref}>
        <BottomToUpTransitionView
          key={id}
          appear={!noAppear}
          exit={{ opacity: 0 }}
        >
          <div className="note-article relative">
            <ClientOnly>
              <div className="title-headline dark:text-shizuku-text">
                <span className="inline-flex items-center">
                  <time className="font-medium">{dateFormat}</time>
                  {!isPreview && (
                    <div className="ml-4 inline-flex items-center space-x-2">
                      {isLogged ? (
                        <IconTransition
                          currentState={bookmark ? 'solid' : 'regular'}
                          regularIcon={
                            <RegularBookmark
                              className="cursor-pointer"
                              onClick={onMarkToggle}
                            />
                          }
                          solidIcon={
                            <SolidBookmark
                              className="text-red cursor-pointer"
                              onClick={onMarkToggle}
                            />
                          }
                        />
                      ) : bookmark ? (
                        <SolidBookmark className="text-red" />
                      ) : null}
                      {note?.hide && (
                        <FluentEyeHide20Regular
                          className={!isLogged ? 'text-red' : ''}
                        />
                      )}
                    </div>
                  )}
                </span>
              </div>
            </ClientOnly>
            {isPreview && (
              <Banner className="mt-8" type="info">
                正在处于预览模式
              </Banner>
            )}
            <Collapse isOpened={!!banner}>
              {banner && (
                <div
                  className={clsx(
                    'w900:ml-[-1.25em] w900:mr-[-1.25em] w900:text-sm ml-[calc(-3em)] mr-[calc(-3em)] mt-8 flex justify-center p-4 leading-8',
                    banner.className,
                  )}
                  style={banner.style}
                >
                  {banner.message}
                </div>
              )}
            </Collapse>

            <div>
              <h1 className="!before:hidden headline dark:text-shizuku-text !mt-8 text-center">
                <FloatPopover
                  triggerComponent={() => <>{title}</>}
                  placement="bottom"
                >
                  {tips}
                </FloatPopover>
                {isLogged && url && !isPreview ? (
                  <a
                    data-hide-print
                    className="edit-link"
                    target="_blank"
                    href={resolveUrl(`#/notes/edit?id=${id}`, url.adminUrl)!}
                  >
                    编辑
                  </a>
                ) : null}
              </h1>

              {children}
            </div>
          </div>
        </BottomToUpTransitionView>

        {!isPreview && <NoteTimelineList noteId={id} />}
      </main>
    )
  },
)
