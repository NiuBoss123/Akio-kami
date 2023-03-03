import { clsx } from 'clsx'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import type { FC } from 'react'
import React, { useCallback, useMemo } from 'react'
import { Modifier, useShortcut } from 'react-shortcut-guide'
import { TransitionGroup } from 'react-transition-group'

import {
  BxBxsArrowToTop,
  FaSolidHeadphonesAlt,
} from '@mx-space/kami-design/components/Icons/for-footer'
import { RootPortal } from '@mx-space/kami-design/components/Portal'
import { ScaleTransitionView } from '@mx-space/kami-design/components/Transition/scale'

import { useJotaiStore } from '~/atoms/store'
import { TrackerAction } from '~/constants/tracker'
import { useAnalyze } from '~/hooks/use-analyze'
import {
  useDetectPadOrMobile,
  useIsOverFirstScreenHeight,
} from '~/hooks/use-viewport'
import { useStore } from '~/store'
import { springScrollToTop } from '~/utils/spring'

import styles from './actions.module.css'

const timeout = { exit: 300 }

const FooterActionsBase: FC<{
  children?: React.ReactNode
}> = (props) => {
  const appStore = useJotaiStore('app')
  const isOverFirstScreenHeight = useIsOverFirstScreenHeight(appStore)

  const isPadOrMobile = useDetectPadOrMobile(appStore)
  const { scrollDirection } = appStore

  const shouldHideActionButtons = useMemo(() => {
    if (!isPadOrMobile) {
      return false
    }

    return isOverFirstScreenHeight && scrollDirection == 'down'
  }, [isOverFirstScreenHeight, isPadOrMobile, scrollDirection])

  const { event } = useAnalyze()

  const toTop = useCallback(() => {
    springScrollToTop()
    event({
      action: TrackerAction.Click,
      label: '底部点击回到顶部',
    })
  }, [])

  return (
    <div
      className={clsx(
        styles.action,
        shouldHideActionButtons && styles['hidden'],
      )}
    >
      <button
        aria-label="to top"
        className={clsx(
          styles['top'],
          isOverFirstScreenHeight ? styles['active'] : '',
        )}
        onClick={toTop}
      >
        <BxBxsArrowToTop />
      </button>

      {props.children}
    </div>
  )
}

export const FooterActions: FC = observer(() => {
  const { actionStore, musicStore } = useStore()

  const { event } = useAnalyze()

  const handlePlayMusic = useCallback(() => {
    event({
      action: TrackerAction.Click,
      label: `底部播放器点击`,
    })
    runInAction(() => {
      musicStore.setHide(!musicStore.isHide)
      musicStore.setPlay(!musicStore.isHide)
    })
  }, [])

  useShortcut(
    'P',
    [Modifier.Command, Modifier.Shift],
    handlePlayMusic,
    '播放音乐',
  )

  return (
    <RootPortal>
      <FooterActionsBase>
        <TransitionGroup>
          {actionStore.actions.map((action) => {
            const El = action.element ?? (
              <button
                aria-label="footer action button"
                onClick={action.onClick}
              >
                {action.icon}
              </button>
            )

            return (
              <ScaleTransitionView
                key={action.id}
                unmountOnExit
                timeout={timeout}
              >
                {El}
              </ScaleTransitionView>
            )
          })}
        </TransitionGroup>
        <button aria-label="open player" onClick={handlePlayMusic}>
          <FaSolidHeadphonesAlt />
        </button>
      </FooterActionsBase>
    </RootPortal>
  )
})
