const mongoose = require("mongoose");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

const isProjectMember = async (projectId, userId) => {
  const project = await Project.findById(projectId).select("members");
  if (!project) return { exists: false, member: false };

  const member = project.members.some((id) => id.toString() === userId.toString());
  return { exists: true, member };
};

const createTask = async (req, res) => {
  const { title, description, assignedTo, status, projectId, dueDate } = req.body;

  if (!mongoose.isValidObjectId(projectId) || !mongoose.isValidObjectId(assignedTo)) {
    return res.status(400).json({ message: "Invalid projectId or assignedTo id." });
  }

  const [assignee, membership] = await Promise.all([
    User.findById(assignedTo).select("_id"),
    isProjectMember(projectId, req.user._id),
  ]);

  if (!assignee) return res.status(404).json({ message: "Assignee not found." });
  if (!membership.exists) return res.status(404).json({ message: "Project not found." });
  if (!membership.member) {
    return res.status(403).json({ message: "Not authorized for this project." });
  }

  const task = await Task.create({
    title,
    description,
    assignedTo,
    status,
    projectId,
    dueDate,
    createdBy: req.user._id,
  });

  const populated = await Task.findById(task._id)
    .populate("assignedTo", "name email role")
    .populate("projectId", "title")
    .populate("createdBy", "name email role");

  return res.status(201).json(populated);
};

const getTasks = async (req, res) => {
  let filter = {};
  if (req.user.role === "Member") {
    filter = { assignedTo: req.user._id };
  }

  const tasks = await Task.find(filter)
    .sort({ dueDate: 1 })
    .populate("assignedTo", "name email role")
    .populate("projectId", "title")
    .populate("createdBy", "name email role");

  return res.json(tasks);
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid task id." });
  }

  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  const isAssignedMember = task.assignedTo.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "Admin";

  if (!isAdmin && !isAssignedMember) {
    return res.status(403).json({ message: "You can update only your assigned tasks." });
  }

  const updatePayload = {};
  const allowedFields = ["title", "description", "status", "assignedTo", "dueDate"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updatePayload[field] = req.body[field];
    }
  });

  if (!isAdmin) {
    delete updatePayload.assignedTo;
    delete updatePayload.title;
    delete updatePayload.description;
    delete updatePayload.dueDate;
  }

  const updatedTask = await Task.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  })
    .populate("assignedTo", "name email role")
    .populate("projectId", "title")
    .populate("createdBy", "name email role");

  return res.json(updatedTask);
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid task id." });
  }

  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  await task.deleteOne();
  return res.json({ message: "Task deleted successfully." });
};

const getDashboardStats = async (req, res) => {
  const now = new Date();
  let filter = {};
  if (req.user.role === "Member") {
    filter = { assignedTo: req.user._id };
  }

  const [total, completed, overdue, statusData] = await Promise.all([
    Task.countDocuments(filter),
    Task.countDocuments({ ...filter, status: "Done" }),
    Task.countDocuments({
      ...filter,
      status: { $ne: "Done" },
      dueDate: { $lt: now },
    }),
    Task.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  return res.json({ total, completed, overdue, statusData });
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getDashboardStats,
};
