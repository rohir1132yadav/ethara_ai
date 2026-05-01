const express = require("express");
const { body } = require("express-validator");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { handleValidation } = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getTasks);
router.get("/dashboard/stats", getDashboardStats);

router.post(
  "/",
  authorize(["Admin"]),
  [
    body("title").trim().notEmpty().withMessage("Task title is required."),
    body("description").optional().isString(),
    body("status")
      .optional()
      .isIn(["Todo", "In Progress", "Done"])
      .withMessage("Invalid status."),
    body("assignedTo").notEmpty().withMessage("assignedTo is required."),
    body("projectId").notEmpty().withMessage("projectId is required."),
    body("dueDate").isISO8601().withMessage("dueDate must be valid ISO date."),
  ],
  handleValidation,
  createTask
);

router.put(
  "/:id",
  [
    body("status")
      .optional()
      .isIn(["Todo", "In Progress", "Done"])
      .withMessage("Invalid status."),
    body("dueDate").optional().isISO8601().withMessage("Invalid dueDate."),
  ],
  handleValidation,
  updateTask
);

router.delete("/:id", authorize(["Admin"]), deleteTask);

module.exports = router;
