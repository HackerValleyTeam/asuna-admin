import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import _           from 'lodash';
import { message } from 'antd';

import { jwtAuthProxy }  from '../adapters/auth';
import { routerActions } from './router.redux';

// --------------------------------------------------------------
// Login actionTypes
// --------------------------------------------------------------

const actionTypes = {
  LOGIN        : 'auth::login',
  LOGIN_FAILED : 'auth::login-failed',
  LOGIN_SUCCESS: 'auth::login-success',
};

const isCurrent = type => type.startsWith('auth::');

// --------------------------------------------------------------
// Login actions
// --------------------------------------------------------------

const actions = {
  login       : (username, password) => ({
    type: actionTypes.LOGIN, payload: { username, password }, error: null,
  }),
  loginSuccess: token => ({
    type: actionTypes.LOGIN_SUCCESS, payload: { token, loginTime: new Date() }, error: null,
  }),
  loginFailed : error => ({
    type: actionTypes.LOGIN_FAILED, payload: {}, error,
  }),
};

// --------------------------------------------------------------
// Login sagas
// --------------------------------------------------------------

function* loginSaga({ payload: { username, password } }) {
  try {
    const { data: { token } } = yield call(jwtAuthProxy.login, username, password);
    yield put(actions.loginSuccess(token));
    message.info(`'${username}' login success`);
    yield put(routerActions.toIndex());
  } catch (error) {
    yield put(actions.loginFailed(error));
    message.error(error);
  }
}

/**
 * 未找到可用 token 时重定向到登录页面
 */
function* tokenWatcher() {
  // const action = yield take('*');
  const { auth: { token }, router: { path } } = yield select();
  if (!token && path !== '/login') {
    yield put(routerActions.toLogin());
  }
}

const sagas = [
  takeLatest(actionTypes.LOGIN, loginSaga),
  takeEvery('*', tokenWatcher),
];

// --------------------------------------------------------------
// Login reducers
// --------------------------------------------------------------

const initialState = {
  loginTime: null,
  username : null,
  token    : null,
};

const reducer = (previousState = initialState, action) => {
  if (isCurrent(action.type)) {
    switch (action.type) {
      // state 中移除 password
      // case actionTypes.LOGIN:
      // case actionTypes.LOGIN_FAILED:
      //   return { username: action.payload.username };
      default:
        return { ...previousState, ..._.omit(action.payload, 'password') };
    }
  } else {
    return previousState;
  }
};

export {
  actionTypes as authActionTypes,
  actions as authActions,
  sagas as authSagas,
  reducer as authReducer,
};
