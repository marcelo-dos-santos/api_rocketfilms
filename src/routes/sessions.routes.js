const { Router } = require("express");

const SessionsController = require("../controller/SessionsController");

const sessionsRoutes = Router();

const sessionsController = new SessionsController();

sessionsRoutes.post("/", sessionsController.create);

module.exports = sessionsRoutes;