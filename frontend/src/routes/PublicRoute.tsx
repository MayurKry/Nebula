import LoginPage from "@/pages/Auth/LoginPage";
import SignUpPage from "@/pages/Auth/SignUpPage";
import ForgotPasswordPage from "@/pages/Auth/ForgotPasswordPage";
import OnboardingPage from "@/pages/Onboarding/OnboardingPage";
import { Route } from "react-router-dom";

function PublicRoutes() {
  return (
    <>
      <Route path="/login" element={<LoginPage />} key="login" />
      <Route path="/signup" element={<SignUpPage />} key="signup" />
      <Route path="/register" element={<SignUpPage />} key="register" />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} key="forgot-password" />
      <Route path="/onboarding" element={<OnboardingPage />} key="onboarding" />
    </>
  );
}

export default PublicRoutes;

