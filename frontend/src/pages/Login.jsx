
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Authenticate the user.
      const response = await api.post("/auth/login", formData);
      const token = response.data.token;

      if (!token) {
        throw new Error("Login response did not contain a token.");
      }

      // Store the token so the API interceptor can authenticate requests.
      localStorage.setItem("token", token);

      // Fetch the authenticated user's details.
      const userResponse = await api.get("/auth/me");
      const authenticatedUser = userResponse.data.user;

      if (!authenticatedUser) {
        throw new Error("Unable to load your account details.");
      }

      // Update React's shared authentication state immediately.
      login(token, authenticatedUser);

      // Navigate home without requiring a page refresh.
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      // Avoid leaving an invalid or partially authenticated session.
      localStorage.removeItem("token");

      setError(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <Link to="/" className="text-2xl font-bold text-teal-700">
          StayEasyy
        </Link>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Welcome back
        </h1>

        <p className="mt-2 text-slate-500">
          Log in to continue to StayEasyy.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-teal-600"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-teal-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-700 p-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-teal-700 hover:text-teal-800"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

