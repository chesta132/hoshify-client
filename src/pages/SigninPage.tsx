import { FormLayout } from "@/components/form/FormLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { VITE_SERVER_URL } from "@/config";
import { useError, useUser } from "@/contexts";
import useForm from "@/hooks/useForm";
import { handleError } from "@/utils/server/handleError";
import { InfoIcon, LucideOctagonX } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

export const SigninPage = () => {
  const { signIn, loading, setLoading, isSignIn, user } = useUser();
  const { setError } = useError();
  const navigate = useNavigate();
  const form = useForm({ email: "", password: "" }, { email: { regex: true }, password: { min: 8 } });
  const {
    form: [formVal],
  } = form;

  useEffect(() => {
    if (isSignIn && user.role === "USER") navigate("/");
  }, [isSignIn, navigate, user.role]);

  const handleSubmit = async () => {
    await signIn(formVal, { throwOnError: true });
    navigate("/");
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      window.location.href = `${VITE_SERVER_URL}/auth/google`;
    } catch (err) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const inputField = {
    elementType: "input",
    size: "sm",
    focusRing: true,
    classLabel: "bg-card",
  } as const;

  return (
    <div className="w-full min-h-dvh justify-center items-center flex">
      <div className="min-h-[70vh] grid place-items-center">
        <div className="min-w-md max-w-md rounded-2xl border bg-card p-6 shadow-soft">
          <div className="flex flex-col items-center mb-4">
            <div className="h-12 w-12 grid place-items-center rounded-2xl bg-primary/10 text-primary font-bold">
              <LucideOctagonX />
            </div>
            <h1 className="mt-3 text-xl font-semibold tracking-tight">Sign In</h1>
            <p className="text-sm text-muted-foreground">Welcome back to Hoshify</p>
          </div>

          <FormLayout
            items={[
              {
                ...inputField,
                placeholder: "Your email",
                label: "email",
                fieldId: "email",
              },
              {
                ...inputField,
                placeholder: "Your password",
                label: "password",
                fieldId: "password",
                type: "password",
              },
              {
                layoutDirection: "row",
                className: "justify-between flex text-sm",
                items: [
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember-me" className="cursor-pointer" />
                    <label htmlFor="remember-me" className="cursor-pointer">
                      Remember Me
                    </label>
                  </div>,
                  { elementType: "link", to: "/forgot-password", className: "text-link", children: "Forgot Password" },
                ],
              },
              { elementType: "separator", label: "OR", afterSubmitButton: true },
              {
                layoutDirection: "column",
                afterSubmitButton: true,
                className: "flex gap-4",
                items: [
                  <Button
                    className="w-full text-foreground inline-flex items-center justify-center gap-2 h-10 px-3 rounded-lg border-2 border-foreground/80 text-sm font-medium shadow bg-card hover:bg-muted/40 hover:text-foreground/80"
                    aria-label="Sign in with Google"
                    type="button"
                    onClick={handleGoogle}
                    disabled={loading}
                  >
                    <GoogleIcon /> Sign in with Google
                  </Button>,
                  {
                    // [WIP] - GUEST FEATURE
                    elementType: "button",
                    disabled: loading,
                    "aria-describedby": "guest-info",
                    className:
                      "w-full text-foreground inline-flex items-center justify-center gap-2 h-10 px-3 rounded-lg border-1 border-border text-sm font-medium shadow bg-card hover:bg-muted/40 hover:text-foreground/80",
                    children: "Continue as Guest",
                  },
                  <div className="flex justify-center items-center gap-2 text-muted-foreground" id="guest-info">
                    <InfoIcon size={14} aria-hidden />
                    <p className="text-xs text-center">Data will be stored locally on this device</p>
                  </div>,
                  <div className="text-[13px] text-center">
                    New here?{" "}
                    <Link to="/signup" className="text-link">
                      Create Account
                    </Link>
                  </div>,
                ],
              },
            ]}
            submitProps={{ children: "Sign In", disabled: loading }}
            form={form}
            onFormSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};
