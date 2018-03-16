const Project = require('../models/project');
const projectUtils = require('../utils/project-utils');
const validationUtils = require('../utils/validation-utils');

const {standardizeProject} = projectUtils;
const {filterSensitiveData} = validationUtils;

/**
 * register - Attempts to register a new user, if a user with that email
 *            address does not already exist.
 */
exports.createProject = async (ctx, next) => {
    try {
        let project = new Project({
            name: ctx.request.body.name,
            prefix: ctx.request.body.prefix,
            description: ctx.request.body.description,
            begin: ctx.request.body.begin,
            end: ctx.request.body.end,
            sprints: ctx.request.body.sprints,
            tickets: ctx.request.body.tickets,
            users: ctx.request.body.users
        });

        const savedProject = await project.save();
        ctx.body = {project: standardizeProject(savedProject)};
        await next();
    } catch (err) {
        ctx.throw(500, err);
    }
};

/**
 * editproject  - Edits single project
 */
exports.editProject = async (ctx, next) => {
    try {
        await Project.findOneAndUpdate({_id: ctx.params.id}, ctx.request.body);
        const project = await Project.findById(ctx.params.id);
        ctx.status = 200;
        ctx.body = {project: standardizeProject(project)};
        await next();
    } catch (err) {
        ctx.throw(500, err);
    }
};

/**
 * getprojects  - Returns JSON for all projects
 * @returns {Array} - Array of projects
 */
exports.getProjects = async (ctx, next) => {
    try {
        const projects = await Project.find({});
        const filteredProjects = projects.map(project => standardizeProject(project));
        ctx.status = 200;
        ctx.body = {projects: filteredProjects};
        await next();
    } catch (err) {
        ctx.throw(500, err);
    }
};

/**
 * getproject  - Returns JSON for specified project
 * @returns {Object}  - Single project object
 */
exports.getProject = async (ctx, next) => {
    try {
        const project = await Project.findById(ctx.params.id);
        ctx.status = 200;
        ctx.body = {project: standardizeProject(project)};
        await next();
    } catch (err) {
        ctx.throw(500, err);
    }
};

/**
 * deleteproject  - Deletes single project
 */
exports.deleteProject = async (ctx, next) => {
    try {
        await Project.findOneAndRemove({_id: ctx.params.id});
        await next();
    } catch (err) {
        ctx.throw(500, err);
    }
};
