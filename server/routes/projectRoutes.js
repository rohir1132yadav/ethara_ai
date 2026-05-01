const express = require("express");
const { body } = require("express-validator");
const {
  createProject,
  getProjects,
  getProjectById,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { handleValidation } = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize(["Admin"]),
  [
    body("title").trim().notEmpty().withMessage("Project title is required."),
    body("description").optional().isString(),
    body("members").isArray({ min: 1 }).withMessage("Members must be a non-empty array."),
  ],
  handleValidation,
  createProject
);

router.get("/", getProjects);
router.get("/:id", getProjectById);

module.exports = router;
