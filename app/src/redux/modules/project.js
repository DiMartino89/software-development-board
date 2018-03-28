import _ from 'lodash';
import {APP_NAMESPACE} from '../../util/redux-constants';
import {put, post, get, del} from '../../util/http-utils';
import {updateStore, buildGenericInitialState, handleError} from '../../util/store-utils';
import {getAppUrl} from "../../util/environment-utils";

const PROJECT_ENDPOINT_BASE = 'project';
const typeBase = `${APP_NAMESPACE}/${PROJECT_ENDPOINT_BASE}/`;

// Constants
export const POST_PROJECT = `${typeBase}POST_PROJECT`;
export const EDIT_PROJECT = `${typeBase}EDIT_PROJECT`;
export const GET_PROJECT = `${typeBase}GET_PROJECT`;
export const GET_PROJECTS = `${typeBase}GET_PROJECTS`;
export const DELETE_PROJECT = `${typeBase}DELETE_PROJECT`;

// Actions

/**
 * createProject - Creates a new project
 * @param {Object} formData  Project's form data
 */
export const createProject = formData => async (dispatch) => {
    try {
        const response = await post(dispatch, POST_PROJECT, `${PROJECT_ENDPOINT_BASE}/create`, formData, true);

        // If the creation was successful, link to dashboard
        if (response) {
            window.location.href = `${getAppUrl()}/dashboard`;
        }
    } catch (err) {
        await handleError(dispatch, err, POST_PROJECT);
    }
};

/**
 * updateProject - Updates an existing Project
 * @param {Object} formData  Project's form data
 */
export const editProject = (id, formData) => async (dispatch) => {
    try {
        const response = await put(dispatch, EDIT_PROJECT, `${PROJECT_ENDPOINT_BASE}/${id}`, formData, true);

        // If the creation was successful, link to dashboard
        if (response) {
            location.reload();
            //window.location.href = `${getAppUrl()}/project/${id}`;
        }
    } catch (err) {
        await handleError(dispatch, err, EDIT_PROJECT);
    }
};

/**
 * getProject  - Fetches project from API, given id
 *
 * @param {String} id Project's id for lookup
 * @returns {Promise}
 */
export const getProject = id => async (dispatch) => {
    try {
        const response = await get(dispatch, GET_PROJECT, `${PROJECT_ENDPOINT_BASE}/${id}`, true);
        return Promise.resolve(response);
    } catch (err) {
        await handleError(dispatch, err, GET_PROJECT);
    }
};

/**
 * getProjects  - Fetches projects from API
 *
 * @returns {Promise}
 */
export const getProjects = () => async (dispatch) => {
    try {
        const response = await get(dispatch, GET_PROJECTS, `${PROJECT_ENDPOINT_BASE}/`, true);
        return Promise.resolve(response);
    } catch (err) {
        await handleError(dispatch, err, GET_PROJECTS);
    }
};

/**
 * deleteProject  - Deletes project from API
 *
 * @returns {Promise}
 */
export const deleteProject = id => async (dispatch) => {
    try {
        const response = await del(dispatch, DELETE_PROJECT, `${PROJECT_ENDPOINT_BASE}/${id}`, true);
        window.location.href = `${getAppUrl()}/dashboard`;
        return Promise.resolve(response);
    } catch (err) {
        await handleError(dispatch, err, DELETE_PROJECT);
    }
};

// Store
const INITIAL_STATE = {
    project: '',
    projects: '',
    ...buildGenericInitialState([POST_PROJECT, EDIT_PROJECT, GET_PROJECT, GET_PROJECTS, DELETE_PROJECT]),
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case POST_PROJECT:
            return updateStore(state, action, {project: _.get(action, 'payload.project') ? action.payload.project : {}});
        case EDIT_PROJECT:
            return updateStore(state, action, {project: _.get(action, 'payload.project') ? action.payload.project : {}});
        case GET_PROJECT:
            return updateStore(state, action, {project: _.get(action, 'payload.project') ? action.payload.project : {}});
        case GET_PROJECTS:
            return updateStore(state, action, {projects: _.get(action, 'payload.projects') ? _.mapKeys(action.payload.projects, 'id') : {}});
        case DELETE_PROJECT:
            return updateStore(state, action, {projects: _.get(action, 'payload.projects') ? _.mapKeys(action.payload.projects, 'id') : {}});
        default:
            return state;
    }
};
