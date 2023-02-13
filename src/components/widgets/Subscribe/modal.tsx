import { observer } from 'mobx-react-lite'
import { useReducer } from 'react'
import { message } from 'react-message-popup'

import { Input } from '@mx-space/kami-design'
import { MdiEmailFastOutline } from '@mx-space/kami-design/components/Icons'

import { apiClient } from '~/utils/client'

import { useSubscribeStatus } from './query'

interface SubscribeModalProps {
  onConfirm: () => void
}

const subscibeTextMap: Record<string, string> = {
  post_c: '文章',
  note_c: '笔记',
  say_c: '说说',
  recently_c: '速记',
}

const initialState = {
  email: '',
  types: {
    post_c: false,
    note_c: false,
    say_c: false,
    recently_c: false,
  },
}

type Action =
  | { type: 'set'; data: Partial<typeof initialState> }
  | { type: 'reset' }

const useFormData = () => {
  const [state, dispatch] = useReducer(
    (state: typeof initialState, payload: Action) => {
      switch (payload.type) {
        case 'set':
          return { ...state, ...payload.data }
        case 'reset':
          return initialState
      }
    },
    { ...initialState },
  )
  return [state, dispatch] as const
}

export const SubscribeModal = observer<SubscribeModalProps>(({ onConfirm }) => {
  const [state, dispatch] = useFormData()

  const query = useSubscribeStatus()

  const handleSubList = async () => {
    if (!state.email) {
      message.error('请输入邮箱')
      return
    }
    if (Object.values(state.types).every((type) => !type)) {
      message.error('请选择订阅类型')
      return
    }
    const { email, types } = state
    await apiClient.subscribe.subscribe(
      email,
      Object.keys(types).filter((name) => state.types[name]) as any[],
    )

    message.success('订阅成功')
    dispatch({ type: 'reset' })
    onConfirm()
  }

  return (
    <form action="#" onSubmit={handleSubList} className="flex flex-col gap-5">
      <Input
        type="text"
        placeholder="留下你的邮箱哦 *"
        required
        prefix={<MdiEmailFastOutline />}
        value={state.email}
        onChange={(e) => {
          dispatch({ type: 'set', data: { email: e.target.value } })
        }}
      />
      <div className="flex gap-10">
        {Object.keys(state.types)
          .filter((type) => query.data?.allowTypes.includes(type as any))
          .map((name) => (
            <fieldset
              className="inline-flex items-center children:cursor-pointer text-lg"
              key={name}
            >
              <input
                type="checkbox"
                onChange={(e) => {
                  dispatch({
                    type: 'set',
                    data: {
                      types: {
                        ...state.types,
                        [name]: e.target.checked,
                      },
                    },
                  })
                }}
                checked={state.types[name]}
                id={name}
              />
              <label htmlFor={name} className="text-shizuku">
                {subscibeTextMap[name]}
              </label>
            </fieldset>
          ))}
      </div>
      <button className="btn yellow">订阅</button>
    </form>
  )
})
