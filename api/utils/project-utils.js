const _ = require('lodash');

/**
 * standardizeproject - Standardizes project and strips unnecessary data
 * @param   {Object}  project  Full project object
 * @returns {Object}        Stripped down project information
 */
const standardizeProject = project => ({
    id: _.get(project, '_id') || '',
    name: _.get(project, 'name') || '',
    prefix: _.get(project, 'prefix') || '',
    description: _.get(project, 'description') || '',
    begin: _.get(project, 'begin') || '',
    end: _.get(project, 'end') || '',
    sprints: _.get(project, 'sprints') || '',
    users: _.get(project, 'users') || '',
    tickets: _.get(project, 'tickets') || '',
});

module.exports = {
    standardizeProject,
};
