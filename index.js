import Express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";
import { MongoClient } from "mongodb";
import {
  URL,
  MODEL,
  API_KEY,
  SCHEMA,
  PORT,
  OUTPUT_SCHEMA,
  BUDGET,
  TRAVEL_MODE,
  INTERESTS,
} from "./constants/index.js";
import removeUnwantedChars from "./helpers/removeUnwanted.js";
import Ajv from "ajv";

const ajv = new Ajv();

// connecting to db
const client = new MongoClient(URL, { useNewUrlParser: true });
client.connect((err) => {
  if (err) {
    console.log("Error connecting to db", err);
  } else {
    console.log("Connected successfully to db");
  }
});

const app = Express();
// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: false,
  })
);
// Validate output schema
const validateOutput = ajv.compile(OUTPUT_SCHEMA);

app.get("/", async (req, res) => {
  const DAYS = req.query.days;
  const DESTINATION = req.query.destination;

  if (!DAYS || !DESTINATION) {
    return res.status(400).json({
      error:
        "Please provide values for 'days' and 'destination' query parameters.",
    });
  }

  try {
    const Prompt = `Plan a ${DAYS}-day trip to ${DESTINATION}. I need result according to this schema ${SCHEMA} and please strictly follow this with no extra-text other than json. Please don't put any extra gibberish characters.`;
    const headers = {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    };

    const data = {
      model: MODEL,
      messages: [{ role: "user", content: Prompt }],
      response_format: { type: "json_object" },
    };
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      data,
      { headers }
    );
    const cleanedRes = removeUnwantedChars(
      response.data.choices[0].message.content
    );
    const tripPlan = JSON.parse(cleanedRes);
    const obj = {};
    obj.plan = tripPlan;

    console.log("Data Logged.");
    res.send(obj);
  } catch (error) {
    throw error;
  }
});

app.post("/detailed-plan", async (req, res) => {
  const { days, destination, interests, budget, travelMode } = req.body;

  if (!days || !destination || !interests || !budget || !travelMode) {
    return res.status(400).json({
      error:
        "Please provide values for 'days', 'destination', 'interests', 'budget', and 'travelMode' in the request body.",
    });
  }

  if (
    !Array.isArray(interests) ||
    !interests.every((i) => INTERESTS.includes(i.toLowerCase()))
  ) {
    return res.status(400).json({ error: "Invalid interests provided." });
  }

  if (!BUDGET.includes(budget.toLowerCase())) {
    return res.status(400).json({ error: "Invalid budget provided." });
  }

  if (!TRAVEL_MODE.includes(travelMode.toLowerCase())) {
    return res.status(400).json({ error: "Invalid travel mode provided." });
  }

  try {
    const Prompt = `Plan a ${days}-day trip to ${destination} for someone interested in ${interests.join(
      ", "
    )} with a budget of ${budget} and traveling by ${travelMode}. Please provide a detailed itinerary following this schema ${JSON.stringify(
      OUTPUT_SCHEMA
    )}. Ensure the response is strictly in JSON format with no extra text.`;
    const headers = {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    };

    const data = {
      model: "gpt-4o",
      messages: [{ role: "user", content: Prompt }],
      response_format: { type: "json_object" },
    };

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      data,
      { headers }
    );

    // const cleanedRes = removeUnwantedChars(
    //   response.data.choices[0].message.content
    // );
    // const itineraryPlan = JSON.parse(cleanedRes);

    // if (!validateOutput(itineraryPlan)) {
    //   return res.status(500).json({
    //     error:
    //       "Generated itinerary does not comply with the expected schema.",
    //     details: validateOutput.errors,
    //   });
    // }

    const obj = {};
    obj.plan = response.data.choices[0].message.content;

    console.log("Itinerary Logged.");
    res.send(obj);
  } catch (error) {
    console.error("Error generating itinerary", error);
    res.status(500).json({ error: "Failed to generate itinerary." });
  }
});

app.get("/hello", async (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log("app listening on port", PORT);
});
