 import { useState, useEffect } from "react"; 

const clientId = "3MVG97L7PWbPq6UxbermXaF46rSHhZglCFjA0fJxc6_5BIJDw7lM_000dgNljeQGpMzJLOoWXksGQfppH7IsX";
const redirectUri = "https://salesforce-app-eight.vercel.app/callback";

// 🔐 LOGIN
const loginToSalesforce = () => {
  const url =
    `https://login.salesforce.com/services/oauth2/authorize` +
    `?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}`;

  window.location.href = url;
};

// 🔑 HANDLE TOKEN FROM URL
const handleCallback = () => {
  if (window.location.hash) {
    const params = new URLSearchParams(
      window.location.hash.replace("#", "")
    );

    const accessToken = params.get("access_token");
    const instanceUrl = params.get("instance_url");

    if (accessToken && instanceUrl) {
      localStorage.setItem("sf_token", accessToken);
      localStorage.setItem("sf_instance", instanceUrl);

      window.location.href = "/";
    }
  }
};

// 📥 FETCH RULES
const getValidationRules = async () => {
  const token = localStorage.getItem("sf_token");
  const instance = localStorage.getItem("sf_instance");

  if (!token || !instance) {
    alert("Login first");
    return [];
  }

  const query =
    "SELECT Id, ValidationName, Active, ErrorMessage FROM ValidationRule";

  const res = await fetch(
    `${instance}/services/data/v60.0/tooling/query/?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  return data.records || [];
};

// 🔥 CORRECT TOGGLE FUNCTION
const toggleValidationRule = async (rule) => {
  const token = localStorage.getItem("sf_token");
  const instance = localStorage.getItem("sf_instance");

  try {
    // ⚠️ IMPORTANT: use PATCH instead of container method
    const res = await fetch(
      `${instance}/services/data/v60.0/tooling/sobjects/ValidationRule/${rule.Id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Metadata: {
            active: !rule.Active,
            errorConditionFormula: "true",
            errorMessage: rule.ErrorMessage,
          },
        }),
      }
    );

    if (res.status === 204) {
      alert("✅ Updated in Salesforce");
    } else {
      const err = await res.text();
      console.error(err);
      alert("❌ Update failed");
    }
  } catch (e) {
    console.error(e);
    alert("Error updating rule");
  }
};

// 🔥 ENABLE/DISABLE ALL
const toggleAllRules = async (rules, makeActive, setRules) => {
  for (let r of rules) {
    if (r.Active !== makeActive) {
      await toggleValidationRule(r);
    }
  }

  const updated = await getValidationRules();
  setRules(updated);

  alert("✅ All rules updated");
};

function App() {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    handleCallback();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>Salesforce Integration App</h1>

      <button onClick={loginToSalesforce}>
        Login to Salesforce
      </button>

      <br /><br />

      <button
        onClick={async () => {
          const data = await getValidationRules();
          setRules(data);
        }}
      >
        Get Validation Rules
      </button>

      <br /><br />

      <button onClick={() => toggleAllRules(rules, true, setRules)}>
        Enable All
      </button>

      <button onClick={() => toggleAllRules(rules, false, setRules)}>
        Disable All
      </button>

      <br /><br />

      {rules.length > 0 && (
        <table border="1" style={{ margin: "auto" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Active</th>
              <th>Error</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {rules.map((r) => (
              <tr key={r.Id}>
                <td>{r.ValidationName}</td>
                <td>{r.Active ? "Yes" : "No"}</td>
                <td>{r.ErrorMessage}</td>
                <td>
                  <button
                    onClick={async () => {
                      await toggleValidationRule(r);
                      const updated = await getValidationRules();
                      setRules(updated);
                    }}
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;