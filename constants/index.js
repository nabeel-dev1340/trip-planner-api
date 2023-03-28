import dotenv from "dotenv";
dotenv.config();

export const URL = process.env.MONGO_URL;
export const MODEL = "gpt-3.5-turbo";
export const PORT = process.env.PORT || 3030;
export const API_KEY = process.env.OPENAI_API_KEY;
export const SCHEMA = `[
  {
    "day": 1,
    "activities": [
      {
        "time": "9:00 AM",
        "description": "Arrive in Skardu and check-in to hotel"
      },
    ]
  }
]`;
