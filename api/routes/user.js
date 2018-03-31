const Router = require('koa-router');
const multer = require('koa-multer');
const crypto = require('crypto');
const fs = require('fs');
const userControllers = require('../controllers/user');
const authControllers = require('../controllers/auth');

const {
    jwtAuth,
} = authControllers;

const {
    getUser,
    getUsers,
    deleteUser,
    editUser,
} = userControllers;

const router = new Router({prefix: '/user'});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../api/uploads');
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, raw.toString('hex') + '.' + file.originalname.split('.')[1]);
        });
    }
});

const upload = multer({storage: storage});

router.post('/avatar', upload.single('file'),
    async (ctx, next) => {
        try {
            const ext = ctx.req.file.filename.split('.')[1];
            fs.rename('../api/uploads/' + ctx.req.file.filename, '../api/uploads/' + ctx.req.body.filename + '.' + ext, function (err) {
                if (err) console.log('ERROR: ' + err);
            });
            ctx.body = {
                status: true,
                info: JSON.stringify(ctx.req.file)
            };
            await next();
        } catch (err) {
            ctx.body = {
                status: false,
                info: err.message,
            }
        }
    });
router.get('/:id/avatar', jwtAuth,
    async (ctx, next) => {
        try {
            fs.readFile('../api/uploads/' + ctx.req.body.filename, function read(err, data) {
                if (err) {
                    throw err;
                }

                ctx.body = data;
            });
            await next();
        } catch (err) {
            ctx.body = {
                status: false,
                info: err.message,
            }
        }
    });
router.get('/', jwtAuth, getUsers);
router.get('/:id', jwtAuth, getUser);
router.delete('/:id', jwtAuth, deleteUser);
router.put('/:id', jwtAuth, editUser);

module.exports = router;
