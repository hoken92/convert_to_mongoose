import { Schema, model } from "mongoose";

const gradeSchema = new Schema({
  learner_id: {
    type: Number,
    required: true,
    message: "Learner ID field is a required field",
  },
  class_id: {
    type: Number,
    required: true,
    message: "Class ID field is a required field",
  },
});

export default model("Grade", gradeSchema);
