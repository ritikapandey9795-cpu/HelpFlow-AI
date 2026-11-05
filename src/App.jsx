import { useEffect, useState } from "react";
import "./App.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Authentication States
const [isLoggedIn, setIsLoggedIn] = useState(
  !!sessionStorage.getItem("token")
);
const [showRegister, setShowRegister] = useState(
  !sessionStorage.getItem("token")
);
const [authError, setAuthError] = useState("");
const [authLoading, setAuthLoading] = useState(false);
const [registerName, setRegisterName] = useState("");
const [registerEmail, setRegisterEmail] = useState("");
const [registerPassword, setRegisterPassword] = useState("");
const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [userRole, setUserRole] = useState(() => {
    try {
      const savedUser = JSON.parse(sessionStorage.getItem("user") || "null");
      return savedUser?.role || "";
    } catch {
      return "";
    }
  });

  // AI Feature States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPriorityLoading, setAiPriorityLoading] = useState(false);
  const [aiTroubleshootLoading, setAiTroubleshootLoading] = useState(false);

  const [aiSuggestions, setAiSuggestions] = useState("");
  const [suggestedPriority, setSuggestedPriority] = useState("Medium");
  const [priorityAnalyzed, setPriorityAnalyzed] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionSummary, setResolutionSummary] = useState("");

  // Fetch all tickets
  // Fetch tickets only after login
useEffect(() => {
  if (!isLoggedIn) {
    setLoading(false);
    return;
  }

  async function fetchTickets() {
    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Tickets load nahi ho paaye.");
      }

      const result = await response.json();

      const formattedTickets = result.data.map((ticket) => ({
        ...ticket,
        id: ticket._id,
        createdAt: new Date(ticket.createdAt).toLocaleString(),
      }));

      setTickets(formattedTickets);
    } catch (err) {
      setError("Backend se connect nahi ho pa raha. Server check karo.");
    } finally {
      setLoading(false);
    }
  }

  fetchTickets();
}, [isLoggedIn]);

  // Create new ticket
  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const newTicket = {
  title: formData.get("title").trim(),
  category: formData.get("category"),
  priority: formData.get("priority"),
  description: formData.get("description").trim(),
};

if (!newTicket.title || !newTicket.description) {
  setError("Title and description cannot be empty or contain only spaces.");
  return;
}

    try {
      setError("");
      setIsSubmitting(true);
      const response = await fetch("http://localhost:5000/api/tickets", {
        method: "POST",
       headers: {
                 "Content-Type": "application/json",
                   Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        body: JSON.stringify(newTicket),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Ticket create nahi hua.");
      }

      const savedTicket = {
        ...result.data,
        id: result.data._id,
        createdAt: new Date(result.data.createdAt).toLocaleString(),
      };

      setTickets((previousTickets) => [
        savedTicket,
        ...previousTickets,
      ]);

      form.reset();
      setSuggestedPriority("Medium");
      setPriorityAnalyzed(false);
      setAiSuggestions("");
    } catch (err) {
      setError(err.message || "Ticket create nahi ho paaya.");
    }
    finally {
          setIsSubmitting(false);
    }
  }

  // Update ticket status
  async function updateStatus(ticketId, newStatus) {
    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticketId}/status`,
        {
          method: "PATCH",
          headers: {
                   "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                  },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Status update nahi hua.");
      }

      setTickets((previousTickets) =>
        previousTickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status: result.data.status }
            : ticket
        )
      );
    } catch (err) {
      setError(err.message || "Status update nahi ho paaya.");
    }
  }

  // Update ticket priority
  async function updatePriority(ticketId, newPriority) {
    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticketId}/priority`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ priority: newPriority }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Priority update nahi hui.");
      }

      setTickets((previousTickets) =>
        previousTickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, priority: result.data.priority }
            : ticket
        )
      );
    } catch (err) {
      setError(err.message || "Priority update nahi ho paayi.");
    }
  }
  // Delete ticket
async function deleteTicket(ticketId) {
  try {
    setError("");

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this ticket?"
    );

    if (!confirmDelete) return;

    const response = await fetch(
      `http://localhost:5000/api/tickets/${ticketId}`,
      {
         method: "DELETE",
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
               },
          }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Ticket delete nahi hua.");
    }

    setTickets((previousTickets) =>
      previousTickets.filter((ticket) => ticket.id !== ticketId)
    );

  } catch (err) {
    setError(err.message || "Ticket delete nahi ho paaya.");
  }
}

  // AI Category Prediction
  async function predictCategory() {
    try {
      const title = document.getElementById("title").value.trim();
      const description = document.getElementById("description").value.trim();

      if (!title || !description) {
        setError("Please enter issue title and description first.");
        return;
      }

      setAiLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/ai/predict-category",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, description }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "AI category prediction failed.");
      }

      document.getElementById("category").value = result.data.category;
    } catch (err) {
      setError(err.message || "AI category prediction failed.");
    } finally {
      setAiLoading(false);
    }
  }

  // AI Priority Prediction
  async function predictPriority() {
    try {
      const title = document.getElementById("title").value.trim();
      const description = document.getElementById("description").value.trim();

      if (!title || !description) {
        setError("Please enter issue title and description first.");
        return;
      }

      setAiPriorityLoading(true);
      setPriorityAnalyzed(false);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/ai/predict-priority",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, description }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "AI priority prediction failed.");
      }

      setSuggestedPriority(result.data.priority);
      setPriorityAnalyzed(true);
    } catch (err) {
      setError(err.message || "AI priority prediction failed.");
    } finally {
      setAiPriorityLoading(false);
    }
  }
  
  // AI Troubleshooting Suggestions
  async function generateTroubleshooting() {
    try {
      const title = document.getElementById("title").value.trim();
      const description = document.getElementById("description").value.trim();

      if (!title || !description) {
        setError("Please enter issue title and description first.");
        return;
      }

      setAiTroubleshootLoading(true);
      setAiSuggestions("");
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/ai/troubleshoot",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, description }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "AI troubleshooting failed."
        );
      }

      setAiSuggestions(result.data.suggestions);
    } catch (err) {
      setError(err.message || "AI troubleshooting failed.");
    } finally {
      setAiTroubleshootLoading(false);
    }
  }
  
async function generateResolutionSummary() {
  try {
    if (!selectedTicket) {
      setError("Please select a ticket first.");
      return;
    }

    if (!resolutionNotes.trim()) {
      setError("Please enter the actual resolution notes first.");
      return;
    }

    setError("");
    setResolutionSummary("");

    const response = await fetch(
      "http://localhost:5000/api/ai/resolution-summary",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: selectedTicket.title,
          description: selectedTicket.description,
          resolutionNotes,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "AI resolution summary failed."
      );
    }

    setResolutionSummary(result.data.summary);
  } catch (err) {
    setError(err.message || "AI resolution summary failed.");
  }
}


  
  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = `${ticket.title} ${ticket.description}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || ticket.status === statusFilter;

    const matchesCategory =
      categoryFilter === "All" || ticket.category === categoryFilter;

    const ticketDate = new Date(ticket.createdAt);

    const matchesStartDate =
      !startDate || ticketDate >= new Date(`${startDate}T00:00:00`);

    const matchesEndDate =
      !endDate || ticketDate <= new Date(`${endDate}T23:59:59.999`);

    const matchesDate = matchesStartDate && matchesEndDate;

    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });


const priorityChartData = [
  {
    name: "Low",
    count: tickets.filter((ticket) => ticket.priority === "Low").length,
  },
  {
    name: "Medium",
    count: tickets.filter((ticket) => ticket.priority === "Medium").length,
  },
  {
    name: "High",
    count: tickets.filter((ticket) => ticket.priority === "High").length,
  },
];

const categoryChartData = Object.entries(
  tickets.reduce((counts, ticket) => {
    const category = ticket.category || "Other";
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {})
).map(([name, count]) => ({ name, count }));
const openTickets = tickets.filter(
  (ticket) => ticket.status === "Open"
).length;

const inProgressTickets = tickets.filter(
  (ticket) => ticket.status === "In Progress"
).length;

const resolvedTickets = tickets.filter(
  (ticket) => ticket.status === "Resolved"
).length;

const highPriorityTickets = tickets.filter(
  (ticket) => ticket.priority === "High"
).length;

const resolutionRate =
  tickets.length === 0
    ? 0
    : Math.round((resolvedTickets / tickets.length) * 100);

const statusChartData = [
  { name: "Open", count: openTickets },
  { name: "In Progress", count: inProgressTickets },
  { name: "Resolved", count: resolvedTickets },
];
const now = new Date();

const ticketsOlderThan24Hours = tickets.filter((ticket) => {
  const createdDate = new Date(
    ticket.createdAtRaw || ticket.createdAt
  );

  const hoursOld = (now - createdDate) / (1000 * 60 * 60);

  return ticket.status !== "Resolved" && hoursOld > 24;
}).length;

const ticketAgingData = [
  {
    name: "Less than 24 hours",
    count: tickets.filter((ticket) => {
      const date = new Date(ticket.createdAtRaw || ticket.createdAt);
      const hours = (now - date) / (1000 * 60 * 60);

      return ticket.status !== "Resolved" && hours <= 24;
    }).length,
  },
  {
    name: "24–48 hours",
    count: tickets.filter((ticket) => {
      const date = new Date(ticket.createdAtRaw || ticket.createdAt);
      const hours = (now - date) / (1000 * 60 * 60);

      return ticket.status !== "Resolved" && hours > 24 && hours <= 48;
    }).length,
  },
  {
    name: "More than 48 hours",
    count: tickets.filter((ticket) => {
      const date = new Date(ticket.createdAtRaw || ticket.createdAt);
      const hours = (now - date) / (1000 * 60 * 60);

      return ticket.status !== "Resolved" && hours > 48;
    }).length,
  },
];
const handleRegister = async (e) => {
  e.preventDefault();
  setAuthError("");
  setAuthLoading(true);

  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setShowRegister(false);
    setAuthError("Registration successful! Please login.");
  } catch (err) {
    setAuthError(err.message);
  } finally {
    setAuthLoading(false);
  }
};
const handleLogin = async (e) => {
  e.preventDefault();
  setAuthError("");
  setAuthLoading(true);

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.data));
    setUserRole(data.data.role);
    console.log("Logged-in User:", data.data);

    setIsLoggedIn(true);
    setAuthError("");
  } catch (err) {
    setAuthError(err.message);
  } finally {
    setAuthLoading(false);
  }
};
const handleLogout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");

  setIsLoggedIn(false);
  setShowRegister(false);
  setTickets([]);
  setLoginEmail("");
  setLoginPassword("");
};


if (!isLoggedIn) {
  return (
    <main className="auth-container">
      <section className="auth-card">
        <div className="auth-card-heading">
          <div className="auth-logo" aria-hidden="true">HF</div>
          <h2>{showRegister ? "Create Account" : "Welcome Back"}</h2>
          <p>Welcome to HelpFlow AI</p>
          <p>
            {showRegister
              ? "Create an account to manage your IT support tickets."
              : "Sign in to continue to your IT support dashboard."}
          </p>
        </div>

        {authError && (
          <p className="error-message" role="status" aria-live="polite">
            {authError}
          </p>
        )}

        {showRegister ? (
          <form onSubmit={handleRegister}>
            <label htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              placeholder="Enter your full name"
              value={registerName}
              onChange={(event) => setRegisterName(event.target.value)}
              autoComplete="name"
              required
            />

            <label htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              value={registerEmail}
              onChange={(event) => setRegisterEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              placeholder="Create a password"
              value={registerPassword}
              onChange={(event) => setRegisterPassword(event.target.value)}
              autoComplete="new-password"
              required
            />

            <button type="submit" disabled={authLoading}>
              {authLoading ? "Creating Account..." : "Register"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            <button type="submit" disabled={authLoading}>
              {authLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        <div className="auth-switch">
          {showRegister ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setShowRegister(false);
                  setAuthError("");
                }}
              >
                Login
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setShowRegister(true);
                  setAuthError("");
                }}
              >
                Register
              </button>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>HelpFlow AI</h2>
        <p className="tagline">Smart IT Support</p>

        <nav>
          <a className="active" href="#dashboard">Dashboard</a>
          <a href="#create-ticket">Create Ticket</a>
          <a href="#tickets">All Tickets</a>
        </nav>

        <p className="sidebar-bottom">
          AI-powered IT helpdesk
        </p>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">IT SUPPORT CENTER</p>
            <h1>Helpdesk Dashboard</h1>
            <p>Report an issue and get help faster.</p>
          </div>

          <span className="status-badge">
            ● System Online
          </span>
          <button type="button" onClick={handleLogout}>
                  Logout
          </button>
        </header>

        {/* Dashboard Statistics */}
        <section className="stats">
          <div className="stat-card">
            <p>Total Tickets</p>
            <h2>{tickets.length}</h2>
            <span>All reported issues</span>
          </div>

          <div className="stat-card">
            <p>Open Tickets</p>
            <h2>{openTickets}</h2>
            <span>Awaiting support</span>
          </div>

          <div className="stat-card">
            <p>In Progress</p>
            <h2>{inProgressTickets}</h2>
            <span>Currently being handled</span>
          </div>

          <div className="stat-card">
            <p>Resolved Tickets</p>
            <h2>{resolvedTickets}</h2>
            <span>Successfully completed</span>
          </div>

          <div className="stat-card">
            <p>High Priority</p>
            <h2>{highPriorityTickets}</h2>
            <span>Needs urgent attention</span>
          </div>

          <div className="stat-card">
            <p>Resolution Rate</p>
            <h2>{resolutionRate}%</h2>
            <span>Tickets successfully resolved</span>
          </div>
        </section>
         <section className="charts-section">
  <h2>Dashboard Reports</h2>

  <div className="charts-grid">
    <div className="chart-card">
      <h3>Tickets by Status</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={statusChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="chart-card">
      <h3>Tickets by Priority</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={priorityChartData}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label
          >
            {priorityChartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={["#22c55e", "#f59e0b", "#ef4444"][index % 3]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>

    <div className="chart-card">
      <h3>Tickets by Category</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={categoryChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#0d9488" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
  <div className="chart-card">
  <h3>Ticket Aging Analysis</h3>

  <ResponsiveContainer width="100%" height={280}>
    <BarChart data={ticketAgingData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Bar dataKey="count" fill="#6366f1" />
    </BarChart>
  </ResponsiveContainer>
</div>

<div className="chart-card">
  <h3>Tickets Pending for More Than 24 Hours</h3>
  <h2>{ticketsOlderThan24Hours}</h2>
  <p>Unresolved tickets older than 24 hours</p>
</div>
</section>
        {/* Create Ticket Form */}
        <section className="ticket-panel" id="create-ticket">
          <div className="section-heading">
            <div>
              <h2>Create a Support Ticket</h2>
              <p>Describe your IT problem below.</p>
            </div>

            <span className="ai-label">✦ AI ASSISTED</span>
          </div>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Issue title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Wi-Fi is not connecting"
              required
            />

            <label htmlFor="category">Issue category</label>
            <select
              id="category"
              name="category"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              <option>Network / Wi-Fi</option>
              <option>Software Issue</option>
              <option>Hardware Issue</option>
              <option>Login / Access</option>
              <option>Other</option>
            </select>

            <button
              type="button"
              onClick={predictCategory}
              disabled={aiLoading}
            >
              {aiLoading
                ? "✦ AI Analyzing..."
                : "✦ Suggest Category with AI"}
            </button>

            <label htmlFor="priority">Issue priority</label>
            <select
              id="priority"
              name="priority"
              value={suggestedPriority}
              onChange={(event) => {
                setSuggestedPriority(event.target.value);
                setPriorityAnalyzed(false);
              }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <button
              type="button"
              onClick={predictPriority}
              disabled={aiPriorityLoading}
            >
              {aiPriorityLoading
                ? "✦ AI Analyzing Priority..."
                : "✦ Suggest Priority with AI"}
            </button>

            {priorityAnalyzed && (
              <div className="ai-result-box">
                <h3>✦ AI Priority Analysis</h3>
                <p>
                  Suggested Priority:{" "}
                  <strong>{suggestedPriority}</strong>
                </p>
                <p>✓ AI analysis completed</p>
              </div>
            )}
            
  <button
    type="button"
    onClick={generateTroubleshooting}
    disabled={aiTroubleshootLoading}
  >
    {aiTroubleshootLoading
      ? "✦ Generating Solutions..."
      : "✦ AI Troubleshoot"}
  </button>

  {aiSuggestions && (
    <div className="ai-result-box">
      <h3>✦ AI Troubleshooting Suggestions</h3>
      <div className="ai-suggestions">
        {aiSuggestions}
      </div>
    </div>
  )}


            <label htmlFor="description">
              Describe the problem
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Tell us what happened and what you have tried..."
              rows="4"
              required
            />

            <button type="submit">
              Submit Ticket →
            </button>
          </form>
        </section>

        {/* All Tickets */}
        <section className="ticket-panel tickets-list" id="tickets">
          <div className="section-heading">
            <div>
              <h2>All Tickets</h2>
              <p>View and manage reported IT issues.</p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search tickets by title or description..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <div className="filter-row">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Network / Wi-Fi">Network / Wi-Fi</option>
              <option value="Software Issue">Software Issue</option>
              <option value="Hardware Issue">Hardware Issue</option>
              <option value="Login / Access">Login / Access</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="date-filters">
  <div>
    <label htmlFor="startDate">From Date</label>
    <input
      type="date"
      id="startDate"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />
  </div>

  <div>
    <label htmlFor="endDate">To Date</label>
    <input
      type="date"
      id="endDate"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
    />
  </div>

  <button
    type="button"
    onClick={() => {
      setStartDate("");
      setEndDate("");
    }}
  >
    Clear Dates
  </button>
</div>

          {loading ? (
            <p>Loading tickets...</p>
          ) : filteredTickets.length === 0 ? (
            <p className="empty-message">
              No tickets yet. Create your first support ticket above.
            </p>
          ) : (
            <div className="ticket-items">
              {filteredTickets.map((ticket) => (
                <article className="ticket-item" key={ticket.id}>
                  <div className="ticket-item-heading">
                    <div>
                      <h3>{ticket.title}</h3>
                      <p className="ticket-category">
                        {ticket.category}
                      </p>
                    </div>

                    <span
                      className={`ticket-status ${ticket.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <p>{ticket.description}</p>

                  <p className="ticket-date">
                    Created: {ticket.createdAt}
                  </p>

                  <label htmlFor={`priority-${ticket.id}`}>
                    Update priority
                  </label>

                  <select
                    id={`priority-${ticket.id}`}
                    value={ticket.priority || "Medium"}
                    onChange={(event) =>
                      updatePriority(ticket.id, event.target.value)
                    }
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>

                  <label htmlFor={`status-${ticket.id}`}>
                    Update status
                  </label>

                  <select
                    id={`status-${ticket.id}`}
                    value={ticket.status}
                    onChange={(event) =>
                      updateStatus(ticket.id, event.target.value)
                    }
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                  <button
                           type="button"
                           onClick={() => setSelectedTicket(ticket)}
                         >
                        View Details
                  </button>
                  {selectedTicket?.id === ticket.id && (
  <div className="ticket-details">
    <h3>Ticket Details</h3>
    <p><strong>Ticket ID:</strong> {ticket.id}</p>
    <p><strong>Title:</strong> {ticket.title}</p>
    <p><strong>Description:</strong> {ticket.description}</p>
    
<div className="resolution-summary-section">
  <h3>AI Resolution Summary</h3>

  <label>Actual Resolution Notes</label>
  <textarea
    value={resolutionNotes}
    onChange={(e) => setResolutionNotes(e.target.value)}
    placeholder="Describe the steps taken to resolve this ticket..."
    rows={4}
  />

  <button
    type="button"
    onClick={generateResolutionSummary}
  >
    Generate Resolution Summary
  </button>

  {resolutionSummary && (
    <div className="resolution-summary-result">
      <h4>Generated Summary</h4>
      <p>{resolutionSummary}</p>
    </div>
  )}
</div>

    <p><strong>Category:</strong> {ticket.category}</p>
    <p><strong>Priority:</strong> {ticket.priority}</p>
    <p><strong>Status:</strong> {ticket.status}</p>
    <p><strong>Created At:</strong> {ticket.createdAt}</p>

    <button
      type="button"
      onClick={() => setSelectedTicket(null)}
    >
      Close Details
    </button>
  </div>
)}
                  {userRole === "Admin" && (
                       <button
                          type="button"
                          className="delete-btn"
                          onClick={() => deleteTicket(ticket.id)}
                           >
                          Delete Ticket
                     </button>
)}
                </article>
              ))}
            </div>
          )}
        </section>

        <footer>
          HelpFlow AI · Your smarter IT support assistant
        </footer>
      </main>
    </div>
  );
}

export default App;