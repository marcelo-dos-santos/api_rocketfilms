const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");
const upload = multer(uploadConfig.MULTER);
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")

const UsersController = require("../controller/UsersController");

const usersRoutes = Router();

const usersController = new UsersController();

usersRoutes.post("/", usersController.create);
usersRoutes.put("/", ensureAuthenticated, usersController.update);
usersRoutes.delete("/:id", usersController.delete);
usersRoutes.patch("/avatar", ensureAuthenticated, upload.single("avatar"), (request, response) => {console.log(request.file.filename); response.json()});

module.exports = usersRoutes;