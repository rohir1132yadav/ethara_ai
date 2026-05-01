const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");

const createProject = async (req, res) => {
  const { title, description, members = [] } = req.body;
  const uniqueMembers = [...new Set([...members, req.user._id.toString()])];

  const validMembers = await User.find({ _id: { $in: uniqueMembers } }).select(
    "_id"
  );
  if (validMembers.length !== uniqueMembers.length) {
    return res.status(400).json({ message: "One or more members are invalid." });
  }

  const project = await Project.create({
    title,
    description,
    members: uniqueMembers,
    createdBy: req.user._id,
  });

  const populated = await Project.findById(project._id)
    .populate("createdBy", "name email role")
    .populate("members", "name email role");

  return res.status(201).json(populated);
};

const getProjects = async (req, res) => {
  let filter = {};

  if (req.user.role === "Member") {
    filter = { members: req.user._id };
  }

  const projects = await Project.find(filter)
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email role")
    .populate("members", "name email role");

  return res.json(projects);
};

const getProjectById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid project id." });
  }

  const project = await Project.findById(id)
    .populate("createdBy", "name email role")
    .populate("members", "name email role");

  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }

  const isMember = project.members.some(
    (member) => member._id.toString() === req.user._id.toString()
  );
  if (req.user.role === "Member" && !isMember) {
    return res.status(403).json({ message: "Access denied for this project." });
  }

  return res.json(project);
};

module.exports = { createProject, getProjects, getProjectById };
