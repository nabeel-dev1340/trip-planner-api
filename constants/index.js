import dotenv from "dotenv";
dotenv.config();

export const URL = process.env.MONGO_URL;
export const MODEL = "gpt-4o";
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

// Possible types for input fields
export const INTERESTS = [
  "art", "theater", "museums", "history", "architecture", "cultural events",
  "hiking", "wildlife", "beaches", "national parks", "adventure sports",
  "cuisine", "street food", "wine tasting", "breweries", "fine dining",
  "spa", "yoga retreats", "relaxation", "resorts",
  "shopping", "luxury brands", "local markets",
  "theme parks", "zoos", "kid-friendly activities",
  "bars", "clubs", "live music", "theater shows",
  "sports events", "fitness", "cycling",
  "tech", "innovation", "conventions",
  "photography", "scenic views"
];

export const BUDGET = ["low", "medium", "high"];

export const TRAVEL_MODE = [
  "walking", "public transport", "rental car", "bike", "guided tours",
  "private car", "scooter", "rideshare", "mixed"
];
export const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    days: { type: "integer", minimum: 1 },
    destination: { type: "string" },
    budget: { type: "string", enum: BUDGET },
    travelMode: { type: "string", enum: TRAVEL_MODE },
    interests: {
      type: "array",
      items: { type: "string", enum: INTERESTS },
    },
    itinerary: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "integer", minimum: 1 },
          activities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { type: "string" },
                activity: { type: "string" },
                location: { type: "string" },
              },
              required: ["time", "activity", "location"],
            },
          },
        },
        required: ["day", "activities"],
      },
    },
  },
  required: [
    "days",
    "destination",
    "budget",
    "travelMode",
    "interests",
    "itinerary",
  ],
};