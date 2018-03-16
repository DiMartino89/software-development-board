const Router = require('koa-router');
const projectControllers = require('../controllers/project');
const authControllers = require('../controllers/auth');

const {
  jwtAuth,
} = authControllers;

const {
  createProject,
  getProject,
  getProjects,
  deleteProject,
  editProject,
} = projectControllers;

const router = new Router({ prefix: '/project' });

router.post('/create', jwtAuth, createProject);
router.get('/', jwtAuth, getProjects);
router.get('/:id', jwtAuth, getProject);
router.delete('/:id', jwtAuth, deleteProject);
router.put('/:id', jwtAuth, editProject);

module.exports = router;
