const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔴 MUST UPDATE THESE
const ACCESS_TOKEN = "PASTE_YOUR_ACCESS_TOKEN";
const INSTANCE_URL = "https://YOUR_INSTANCE.my.salesforce.com";

// 🔹 FETCH VALIDATION RULES
app.get("/get-rules", async (req, res) => {
  try {
    const query =
      "SELECT Id, ValidationName, Active, ErrorMessage FROM ValidationRule";

    const response = await axios.get(
      `${INSTANCE_URL}/services/data/v59.0/tooling/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    res.json(response.data.records);
  } catch (err) {
    console.error("FETCH ERROR:", err.response?.data || err.message);
    res.status(500).send("Error fetching rules");
  }
});

// 🔹 TOGGLE SINGLE RULE
app.post("/toggle-rule", async (req, res) => {
  const { id, active } = req.body;

  try {
    await axios.patch(
      `${INSTANCE_URL}/services/data/v59.0/tooling/sobjects/ValidationRule/${id}`,
      { Active: active },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.send("Updated successfully");
  } catch (err) {
    console.error("TOGGLE ERROR:", err.response?.data || err.message);
    res.status(500).send("Update failed");
  }
});

// 🔹 TOGGLE ALL RULES
app.post("/toggle-all", async (req, res) => {
  const { active } = req.body;

  try {
    const query = "SELECT Id FROM ValidationRule";

    const rules = await axios.get(
      `${INSTANCE_URL}/services/data/v59.0/tooling/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    for (let rule of rules.data.records) {
      await axios.patch(
        `${INSTANCE_URL}/services/data/v59.0/tooling/sobjects/ValidationRule/${rule.Id}`,
        { Active: active },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
        }
      );
    }

    res.send("All rules updated");
  } catch (err) {
    console.error("TOGGLE ALL ERROR:", err.response?.data || err.message);
    res.status(500).send("Failed to update all");
  }
});

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});