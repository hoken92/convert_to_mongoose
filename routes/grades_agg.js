import express from "express";
import db from "../db/conn.js";
import { ObjectId } from "mongodb";
import Grade from "../models/Grade.js";

const router = express.Router();

/**
 * It is not best practice to seperate these routes
 * like we have done here. This file was created
 * specifically for educational purposes, to contain
 * all aggregation routes in one place.
 */

/**
 * Grading Weights by Score Type:
 * - Exams: 50%
 * - Quizes: 30%
 * - Homework: 20%
 */

// Get the weighted average of a specified learner's grades, per class
router.get("/learner/:id/avg-class", async (req, res) => {
  // let collection = await db.collection("grades");

  try {
    let result = await Grade.aggregate([
      {
        $match: { learner_id: Number(req.params.id) },
      },
      {
        $unwind: { path: "$scores" },
      },
      {
        $group: {
          _id: "$class_id",
          quiz: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "quiz"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          exam: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "exam"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          homework: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "homework"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          class_id: "$_id",
          avg: {
            $sum: [
              { $multiply: [{ $avg: "$exam" }, 0.5] },
              { $multiply: [{ $avg: "$quiz" }, 0.3] },
              { $multiply: [{ $avg: "$homework" }, 0.2] },
            ],
          },
        },
      },
    ]);

    res.send(result).status(200);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Total number of learners
router.get("/stats", async (req, res) => {
  let collection = db.collection("grades");

  // Finds the number of TOTAL learners above 50%
  const weightedAvg = await Grade.aggregate([
    {
      $unwind: {
        path: "$scores",
      },
    },
    {
      $group: {
        _id: "$learner_id",
        quiz: {
          $push: {
            $cond: {
              if: {
                $eq: ["$scores.type", "quiz"],
              },
              then: "$scores.score",
              else: "$$REMOVE",
            },
          },
        },
        exam: {
          $push: {
            $cond: {
              if: {
                $eq: ["$scores.type", "exam"],
              },
              then: "$scores.score",
              else: "$$REMOVE",
            },
          },
        },
        homework: {
          $push: {
            $cond: {
              if: {
                $eq: ["$scores.type", "homework"],
              },
              then: "$scores.score",
              else: "$$REMOVE",
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        learner_id: "$_id",
        avg: {
          $sum: [
            {
              $multiply: [
                {
                  $avg: "$exam",
                },
                0.5,
              ],
            },
            {
              $multiply: [
                {
                  $avg: "$quiz",
                },
                0.3,
              ],
            },
            {
              $multiply: [
                {
                  $avg: "$homework",
                },
                0.2,
              ],
            },
          ],
        },
      },
    },
    {
      $match: {
        avg: { $gt: 50 },
      },
    },
    {
      $count: "learners_above_50_percent",
    },
  ]);

  // Finds the total number of learners
  const totalLearners = await Grade.aggregate([
    {
      $group: {
        _id: "$learner_id",
        class_id: { $push: "$class_id" },
      },
    },
    {
      $count: "total_learners",
    },
  ]);

  const report = [];

  // Calculates percentage of ALL learners above 50%
  const percentageOfLearners = (
    weightedAvg[0].learners_above_50_percent / totalLearners[0].total_learners
  ).toFixed(2);
  report.push(weightedAvg, totalLearners, percentageOfLearners);

  if (!report) res.send("Not found").status(404);
  else res.send(report).status(200);
});

// Returns specifc average to class ID
router.get("/stats/:id", async (req, res) => {
  // let collection = db.collection("grades");

  if (!req.params.id) {
    res.status(400).send("Not found");
    return;
  }

  // Returns the count of class learners above 50%

  try {
  } catch (err) {}
  const learners_above_50 = await Grade.aggregate([
    {
      $match: {
        class_id: Number(req.params.id),
      },
    },
    {
      $unwind: {
        path: "$scores",
      },
    },
    {
      $group: {
        _id: "$learner_id",
        quiz: {
          $push: {
            $cond: {
              if: {
                $eq: ["$scores.type", "quiz"],
              },
              then: "$scores.score",
              else: "$$REMOVE",
            },
          },
        },
        exam: {
          $push: {
            $cond: {
              if: {
                $eq: ["$scores.type", "exam"],
              },
              then: "$scores.score",
              else: "$$REMOVE",
            },
          },
        },
        homework: {
          $push: {
            $cond: {
              if: {
                $eq: ["$scores.type", "homework"],
              },
              then: "$scores.score",
              else: "$$REMOVE",
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        learner_id: "$_id",
        avg: {
          $sum: [
            {
              $multiply: [
                {
                  $avg: "$exam",
                },
                0.5,
              ],
            },
            {
              $multiply: [
                {
                  $avg: "$quiz",
                },
                0.3,
              ],
            },
            {
              $multiply: [
                {
                  $avg: "$homework",
                },
                0.2,
              ],
            },
          ],
        },
      },
    },
    {
      $match: {
        avg: { $gt: 50 },
      },
    },
    {
      $count: "learners_above_50",
    },
  ]);

  // Returns total number of learners in the class id
  const class_learners = await Grade.aggregate([
    {
      $match: {
        class_id: Number(req.params.id),
      },
    },
    {
      $count: "class_learners",
    },
  ]);

  // Calculates the percentage of learners that have a grade above 50%
  const percentage = (
    learners_above_50[0].learners_above_50 / class_learners[0].class_learners
  ).toFixed(2);

  const report = [];
  report.push(learners_above_50, class_learners, percentage);

  if (!report) res.send("Not found").status(404);
  else res.send(report).status(200);
});

export default router;
