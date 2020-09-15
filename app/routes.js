const express = require('express')
const { get } = require('browser-sync')
const router = express.Router()
const fs = require('fs')

// Routes files for URLs/folders
router.use('/v0', require('./routes_v0'))
router.use('/v1', require('./routes_v1'))
router.use('/v2', require('./routes_v2'))
router.use('/v3', require('./routes_v3'))
router.use('/v4', require('./routes_v4'))
router.use('/fcrm-1', require('./fcrm-1'))

module.exports = router
