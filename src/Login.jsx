import React, { useState, useRef , useEffect} from "react";
import "./Login.css";
import cognizantLogo from "./assets/cognizant-logo.png";
import eyeIcon from "./assets/eye-hide.png";
import { useNavigate } from "react-router-dom";
import  {useDEXAgent} from '../src/context/useDEXAgent';
import { v4 as uuidv4 } from 'uuid';

import {
  signIn,
  signOut,
  confirmSignIn,
  fetchAuthSession,
  resendSignUpCode,
} from "aws-amplify/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState(""); // 💡 NEW STATE for resend status
  const { collectDEXData } = useDEXAgent(); // DEX Agent Hook

  useEffect(() => {
  if (!sessionStorage.getItem("dex_session_id")) {
    sessionStorage.setItem("dex_session_id", `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  }
}, []);

  // MFA OTP UI
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);
  const [pendingUser, setPendingUser] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResendMessage(""); // Clear resend message on new login attempt
    const sessionId = sessionStorage.getItem("dex_session_id");

    try {
      await signOut();
      const dexPayload = await collectDEXData();

      const finalPayload = {
        stage: "LOGIN",         
        session_id: sessionId,    
        email: email,     
      
        ...dexPayload ,

      };
      const dexResponse = await fetch("https://deb5xke9pl.execute-api.us-west-2.amazonaws.com/DEXPROD1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });
      const dexResult = await dexResponse.json();
      console.log("DEX Login Analysis:", dexResult);

      // 3. Logic based on Trust Score
      if (dexResult.dex_report && dexResult.dex_report.trust_score < 0.3) {
        setError("Security Risk: Device or Network flagged.");
        setLoading(false);
        return; // Block login if high risk
      }

    } catch (err) {
      console.warn("No user was signed in", err);
      console.warn("DEX Agent failed, proceeding with standard auth", err);
    }

    try {
      const user = await signIn({
        username: email,
        password: password,
      });

      console.log("SignIn response:", user);

      // 🔹 Handle NEW_PASSWORD_REQUIRED
      if (
        user.nextStep?.signInStep ===
        "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
      ) {
        const newPw = prompt("Please set a new password:");
        await confirmSignIn({
          challengeResponse: newPw,
        });
        // Alternatively, you can use completeNewPassword:
        // await completeNewPassword({
        //   newPassword: newPw,
        //   username: email,
        // });
        setPendingUser(user);
        setShowOTP(true);
        setLoading(false);
        return;
      }

      // 🔹 Handle MFA challenge (SMS / TOTP / EMAIL)
      if (
        user.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_SMS_CODE" ||
        user.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE" ||
        user.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE"
      ) {
        console.log("OTP required via:", user.nextStep.codeDeliveryDetails);
        setPendingUser(user);
        setShowOTP(true);
        setLoading(false);
        return;
      }

      // 🔹 If login completed without challenge
      if (user.isSignedIn) {
        console.log("✅ Login success:", user);
        const session = await fetchAuthSession();
        console.log("Tokens:", session.tokens);
      }

      setLoading(false);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    const code = otp.join("");
    if (!code || code.length < 6) {
      setError("Please enter the full OTP.");
      return;
    }

    try {
      // console.log("challengeName", pendingUser.nextStep.signInStep);
      const result = await confirmSignIn({
        challengeResponse: code,
      });
      console.log("MFA success:", result);

      //Fetching session & groups
      const user = await fetchAuthSession();
      const groups =
        // user.signInUserSession?.idToken?.payload["cognito:groups"] || [];
        user?.tokens?.idToken?.payload["cognito:groups"] || [];
      console.log("User groups:", groups);

      if (groups.includes("BankingOfficers")) {
        navigate("/banking-dashboard");
      } else if (groups.includes("LoanApplicants")) {
        navigate("/loan-dashboard");
        // navigate("/banking-dashboard");
      }

      setShowOTP(false);
      setOtp(Array(6).fill(""));
      setLoading(false);
    } catch (err) {
      console.error("MFA failed:", err);
      setError(err.message || "MFA failed");
      setLoading(false);
    }
  };

  // 💡 NEW FUNCTION: Resend OTP
  const handleResendOTP = async () => {
    if (!pendingUser) return; // Should only run when an MFA challenge is pending
    setLoading(true);
    setError("");
    setResendMessage("");
    setOtp(Array(6).fill("")); // Clear OTP input fields

    try {
      const result = await resendSignUpCode();
      console.log("Resend code details:", result.codeDeliveryDetails);
      setResendMessage(
        `New code sent to ${result.codeDeliveryDetails.destination}`
      );
    } catch (err) {
      console.error("Resend code failed:", err);
      setError(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (idx < otp.length - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx]) {
      const prev = Math.max(0, idx - 1);
      inputsRef.current[prev]?.focus();
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={cognizantLogo} alt="Cognizant" className="logo" />
        <h2>Welcome back</h2>

        {!showOTP ? (
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              className="login-details"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="login-details"
                className="password-input"
                placeholder="Type your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <img
                src={eyeIcon}
                alt="Toggle visibility"
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            {error && <p className="error">{error}</p>}
          </form>
        ) : (
          <div className="otp-container">
            <div className="otp-inputs">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="otp-input"
                />
              ))}
            </div>

            <button
              onClick={handleOTPSubmit}
              disabled={loading}
              className="otp-submit-button"
            >
              {loading ? "Verifying..." : "Submit OTP"}
            </button>
            {/* 💡 NEW RESEND OTP BUTTON */}
            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="resend-otp-button"
              style={{
                marginTop: "10px",
                background: "none",
                border: "none",
                color: "#0070c0", // Example blue link color
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Resend OTP
            </button>
          </div>
        )}

        {!showOTP && (
          <p className="signup-text">
            No Account Yet? <a href="#">Get Yours Now</a>
          </p>
        )}
      </div>

      <div className="login-right"></div>
    </div>
  );
}
