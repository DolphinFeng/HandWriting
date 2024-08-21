import { createStore, compose, applyMiddleware, AnyAction } from 'redux'
import thunk, { ThunkMiddleware } from 'redux-thunk'
import reducers from './reducers'

const composeEnhancers: typeof compose =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  reducers,
  composeEnhancers(
    applyMiddleware(thunk as ThunkMiddleware<RootState, AnyAction, unknown>)
  )
)

export type RootState = ReturnType<typeof reducers>

export default store
