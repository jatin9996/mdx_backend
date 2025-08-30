import express from "express";
import { getAllEntity } from "../../controllers/entity.controller.js";

const router = express.Router();

router.get('/', getAllEntity);

export default router;
