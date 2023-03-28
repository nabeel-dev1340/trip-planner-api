import Express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";
import { MongoClient } from "mongodb";
import { URL, MODEL, API_KEY, SCHEMA, PORT } from "./constants/index.js";
import removeUnwantedChars from "./helpers/removeUnwanted.js";

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

app.get("/", async (req, res) => {
  const DAYS = req.query.days;
  const DESTINATION = req.query.destination;

  const key = `${DAYS.toLowerCase()}-${DESTINATION.toLowerCase()}`;

  try {
    // checking if data already exists
    const db = client.db("test");
    const trips = db.collection("trips");
    const tripData = await trips.findOne({ key });

    if (tripData) {
      res.send(tripData);
    } else {
      const Prompt = `Plan a ${DAYS}-day trip to ${DESTINATION}. I need result according to this schema ${SCHEMA} and please strictly follow this with no extra-text other than json.`;
      const headers = {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      };

      const data = {
        model: MODEL,
        messages: [{ role: "user", content: Prompt }],
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

      // inserting data into db
      obj.key = `${key}`;
      await trips.insertOne(obj);

      console.log("Data Logged.");
      res.send(obj);
    }
  } catch (error) {
    throw error;
  }
});

app.get("/hello", async (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log("app listening on port", PORT);
});
