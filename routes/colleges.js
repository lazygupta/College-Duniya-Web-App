const express = require('express');
const router = express.Router();
const colleges = require('../controllers/colleges');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCollege } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const College = require('../models/college');

router.route('/')
    .get(catchAsync(colleges.index))
    .post(isLoggedIn, upload.array('image'), validateCollege, catchAsync(colleges.createCollege))


router.get('/new', isLoggedIn, colleges.renderNewForm)

router.route('/:id')
    .get(catchAsync(colleges.showCollege))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCollege, catchAsync(colleges.updateCollege))
    .delete(isLoggedIn, isAuthor, catchAsync(colleges.deleteCollege));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(colleges.renderEditForm))



module.exports = router;