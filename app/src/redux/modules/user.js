import _ from 'lodash';
import {APP_NAMESPACE} from '../../util/redux-constants';
import {post, put, get, del} from '../../util/http-utils';
import {updateStore, buildGenericInitialState, handleError} from '../../util/store-utils';
import {CHANGE_AUTH, GET_AUTHENTICATED_USER} from './authentication';
import {getAppUrl} from "../../util/environment-utils";

const USER_ENDPOINT_BASE = 'user';
const typeBase = `${APP_NAMESPACE}/${USER_ENDPOINT_BASE}/`;

// Constants
export const POST_AVATAR = `${typeBase}POST_AVATAR`;
export const EDIT_USER = `${typeBase}EDIT_USER`;
export const GET_USER = `${typeBase}GET_USER`;
export const GET_USERS = `${typeBase}GET_USERS`;
export const DELETE_USER = `${typeBase}DELETE_USER`;

// Actions
/**
 * updateUser - Updates an existing User
 * @param {Object} formData  User's form data
 */
export const postAvatar = (formData) => async (dispatch) => {
    try {
        const response = await post(dispatch, POST_AVATAR, `${USER_ENDPOINT_BASE}/avatar`, formData, true);
        console.log(response);
    } catch (err) {
        await handleError(dispatch, err, POST_AVATAR);
    }
};

/**
 * updateUser - Updates an existing User
 * @param {Object} formData  User's form data
 */
export const editUser = (id, formData) => async (dispatch) => {
    try {
        const response = await put(dispatch, EDIT_USER, `${USER_ENDPOINT_BASE}/${id}`, formData, true);

        // If the creation was successful, link to dashboard
        if (response) {
            window.location.href = `${getAppUrl()}/user/${id}`;
        }
    } catch (err) {
        await handleError(dispatch, err, EDIT_USER);
    }
};

/**
 * getUser  - Fetches user from API, given id
 *
 * @param {String} id User's id for lookup
 * @returns {Promise}
 */
export const getUser = id => async (dispatch) => {
    try {
        const response = await get(dispatch, GET_USER, `${USER_ENDPOINT_BASE}/${id}`, true);
        return Promise.resolve(response);
    } catch (err) {
        await handleError(dispatch, err, GET_USER);
    }
};

/**
 * getUsers  - Fetches users from API
 *
 * @returns {Promise}
 */
export const getUsers = () => async (dispatch) => {
    try {
        const response = await get(dispatch, GET_USERS, USER_ENDPOINT_BASE, true);
        return Promise.resolve(response);
    } catch (err) {
        await handleError(dispatch, err, GET_USER);
    }
};

/**
 * deleteUser  - Deletes user from API
 *
 * @returns {Promise}
 */
export const deleteUser = id => async (dispatch) => {
    try {
        const response = await del(dispatch, DELETE_USER, `${USER_ENDPOINT_BASE}/${id}`, true);
        window.location.href = `${getAppUrl()}/login`;
        return Promise.resolve(response);
    } catch (err) {
        await handleError(dispatch, err, DELETE_USER);
    }
};

// Store
const INITIAL_STATE = {
    user: '',
    sUser: '',
    users: '',
    ...buildGenericInitialState([POST_AVATAR, EDIT_USER, GET_USER, GET_USERS, DELETE_USER]),
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case CHANGE_AUTH:
            return updateStore(state, action, {user: _.get(action, 'payload.user') ? action.payload.user : {}});
        case POST_AVATAR:
            return updateStore(state, action, {user: _.get(action, 'payload.user') ? action.payload.user : {}});
        case EDIT_USER:
            return updateStore(state, action, {user: _.get(action, 'payload.user') ? action.payload.user : {}});
        case GET_USER:
            return updateStore(state, action, {sUser: _.get(action, 'payload.user') ? action.payload.user : {}});
        case GET_AUTHENTICATED_USER:
            return updateStore(state, action, {user: _.get(action, 'payload.user') ? action.payload.user : {}});
        case GET_USERS:
            return updateStore(state, action, {users: _.get(action, 'payload.users') ? _.mapKeys(action.payload.users, 'id') : {}});
        case DELETE_USER:
            return updateStore(state, action, {users: _.get(action, 'payload.users') ? _.mapKeys(action.payload.users, 'id') : {}});
        default:
            return state;
    }
};

// Selectors
export const getAuthenticatedUser = ({user, authentication}) => user[authentication.user];
