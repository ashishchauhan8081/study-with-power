// ======================================================
// LOGIN PAGE
// ======================================================

function LoginPage({
  onSuccess,
  onRegister,
  onForgot,
  onGoogle,
  onClose,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("📧 Email ID डालें।");
      return;
    }

    if (!password) {
      alert("🔐 Password डालें।");
      return;
    }

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      if (onSuccess) {
        onSuccess(result.user);
      }
    } catch (error) {
      console.error("Login Error:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        alert("❌ Email या Password गलत है।");
      } else if (
        error.code === "auth/user-not-found"
      ) {
        alert("❌ यह account नहीं मिला।");
      } else if (
        error.code === "auth/too-many-requests"
      ) {
        alert(
          "⚠️ बहुत ज्यादा Login प्रयास हुए हैं। कुछ समय बाद फिर कोशिश करें।"
        );
      } else {
        alert(
          "❌ Login Error:\n" +
            (error.message || "Unknown error")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-new">

      <div className="login-card-new">

        {/* Logo */}
        <div className="login-logo-new">
          🔐
        </div>

        {/* Heading */}
        <h1 className="login-title-new">
          Login
        </h1>

        <p className="login-subtitle-new">
          अपने Exam Test account में login करें
        </p>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="login-form-new"
        >

          {/* Email */}
          <div className="login-field-new">

            <label htmlFor="login-email">
              📧 Email ID
            </label>

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Email ID"
              autoComplete="email"
            />

          </div>

          {/* Password */}
          <div className="login-field-new">

            <label htmlFor="login-password">
              🔑 Password
            </label>

            <div className="login-password-box">

              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-eye-btn"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>

            </div>

          </div>

          {/* Login */}
          <button
            type="submit"
            className="login-main-button-new"
            disabled={loading}
          >
            {loading
              ? "⏳ Login हो रहा है..."
              : "🔐 Login"}
          </button>

        </form>

        {/* Forgot */}
        <button
          type="button"
          className="forgot-button-new"
          onClick={onForgot}
        >
          🔑 Forgot Password?
        </button>

        {/* Divider */}
        <div className="login-divider-new">
          <span></span>
          <strong>या</strong>
          <span></span>
        </div>

        {/* Google */}
        <button
          type="button"
          className="google-login-button-new"
          onClick={onGoogle}
        >
          <span className="google-icon">
            G
          </span>

          <span>
            Google से Login
          </span>
        </button>

        {/* Create Account */}
        <div className="create-account-row-new">

          <span>
            नया account बनाना है?
          </span>

          <button
            type="button"
            onClick={onRegister}
          >
            Create Account
          </button>

        </div>

        {/* Back */}
        <button
          type="button"
          className="back-website-button-new"
          onClick={onClose}
        >
          ← Website पर वापस जाएँ
        </button>

      </div>

    </div>
  );
}
