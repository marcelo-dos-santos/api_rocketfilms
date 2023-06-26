const { Router } = require("express");

const TagsController = require("../controller/TagsController");

const tagsRoutes = Router();

const tagsController = new TagsController();

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

tagsRoutes.get("/", ensureAuthenticated, tagsController.index);

module.exports = tagsRoutes;