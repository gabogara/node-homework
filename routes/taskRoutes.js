const express = require("express");

const router = express.Router();

const {
  create,
  index,
  show,
  update,
  deleteTask,
  bulkCreate,
  bulkUpdate,
  bulkDelete,
} = require("../controllers/taskController");

router.route("/").post(create).get(index);
router.route("/bulk").post(bulkCreate).patch(bulkUpdate).delete(bulkDelete);
router.route("/:id").get(show).patch(update).delete(deleteTask);

module.exports = router;
