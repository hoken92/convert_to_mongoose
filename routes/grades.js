import express from "express";
import db from "../db/conn.js";
import { ObjectId } from "mongodb";

import Grade from "../models/Grade.js";

const router = express.Router();

// Create a single grade entry
router.post("/", async (req, res) => {
  try {
    // let collection = await db.collection("grades");
    let newDocument = req.body;

    // rename fields for backwards compatibility
    if (newDocument.student_id) {
      newDocument.learner_id = newDocument.student_id;
      delete newDocument.student_id;
    }

    // let result = await collection.insertOne(newDocument);

    let newGrade = await Grade.create(req.body);
    res.send(newGrade).status(201);
  } catch (err) {
    res.status(404).send(err);
  }
});

// Get a single grade entry
router.get("/:id", async (req, res) => {
  try {
    // let collection = await db.collection("grades");
    // let query = { _id: ObjectId.createFromHexString(req.params.id) };
    // let result = await collection.findOne(query);

    let result = await Grade.findById(req.params.id);

    res.send(result).status(200);
  } catch (err) {
    res.send(err).status(400);
  }
});

// Add a score to a grade entry
router.patch("/:id/add", async (req, res) => {
  try {
    let collection = await db.collection("grades");
    let query = { _id: ObjectId(req.params.id) };

    let result = await collection.updateOne(query, {
      $push: { scores: req.body },
    });
    res.send(result).status(200);
  } catch (err) {
    res.send(err).status(400);
  }
});

// Remove a score from a grade entry
router.patch("/:id/remove", async (req, res) => {
  try {
    let query = { _id: ObjectId(req.params.id) };

    let result = await Grade.updateOne(query, {
      $pull: { scores: req.body },
    });

    res.send(result).status(200);
  } catch (err) {
    res.send(err).status(400);
  }
});

// Delete a single grade entry
router.delete("/:id", async (req, res) => {
  try {
    // let collection = await db.collection("grades");
    // let query = { _id: ObjectId(req.params.id) };
    // let result = await collection.deleteOne(query);

    let deletedGrade = await Grade.findByIdAndDelete(req.params.id);
    res.json(deletedGrade).status(200);
  } catch (err) {
    res.send(err).status(400);
  }
});

// Get route for backwards compatibility
router.get("/student/:id", async (req, res) => {
  res.redirect(`learner/${req.params.id}`);
});

// Get a learner's grade data
router.get("/learner/:id", async (req, res) => {
  try {
    // let collection = await db.collection("grades");
    let query = { learner_id: Number(req.params.id) };

    // Check for class_id parameter
    if (req.query.class) query.class_id = Number(req.query.class);

    // let result = await collection.find(query).toArray();

    let result = await Grade.find(query);

    res.send(result).status(200);
  } catch (err) {
    res.send(err).status(400);
  }
});

// Delete a learner's grade data
router.delete("/learner/:id", async (req, res) => {
  try {
    // let collection = await db.collection("grades");
    let query = { learner_id: Number(req.params.id) };

    // let result = await collection.deleteOne(query);

    const deletedUser = await Grade.findByIdAndDelete(req.params.id);
    res.status(200).json(deletedUser);
  } catch (err) {
    res.send(err).status(400);
  }
});

// Get a class's grade data
router.get("/class/:id", async (req, res) => {
  try {
    // let collection = await db.collection("grades");
    let query = { class_id: Number(req.params.id) };

    // Check for learner_id parameter
    if (req.query.learner) query.learner_id = Number(req.query.learner);

    // let result = await collection.find(query).toArray();
    let result = await Grade.find(query);

    res.send(result).status(200);
  } catch (err) {
    res.send(err).status(400);
  }
});

// Update a class id
router.patch("/class/:id", async (req, res) => {
  try {
    // let collection = await db.collection("grades");
    let query = { class_id: Number(req.params.id) };

    let result = await Grade.updateMany(query);

    res.send(result).status(200);
  } catch (err) {
    res.send(err).status(400);
  }
});

// Delete a class
router.delete("/class/:id", async (req, res) => {
  try {
    // let collection = await db.collection("grades");
    let query = { class_id: Number(req.params.id) };

    // let deletedUser = await collection.deleteMany(query);

    const deletedUser = await Grade.deleteMany(query);
    res.status(200).json(deletedUser);
  } catch (err) {
    res.send(err).status(400);
  }
});

export default router;
