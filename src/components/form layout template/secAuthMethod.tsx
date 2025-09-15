import { InfoIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router";
import type { FormItems } from "../form/FormLayout";
import type { FormFields } from "@/types/form";

// eslint-disable-next-line react-refresh/only-export-components
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

export const secAuthMethod = <F extends FormFields>(
  loading: boolean,
  handleGoogle: () => Promise<void>,
  type: "signin" | "signup"
): FormItems<F, "column"> => {
  return {
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
      type === "signin" ? (
        <div className="text-[13px] text-center">
          New here?{" "}
          <Link to="/signup" className="text-link">
            Create Account
          </Link>
        </div>
      ) : (
        <div className="text-center flex flex-col gap-2">
          {/* [WIP] - TERMS & POLICY */}
          <div className="text-xs">
            By signing up you agree to our{" "}
            <Link to={"/terms"} className="text-muted-foreground text-link">
              Terms
            </Link>{" "}
            and{" "}
            <Link className="text-muted-foreground text-link" to={"/privacy-policy"}>
              Privacy Policy.
            </Link>
          </div>
          <div className="text-[13px]">
            Already have an account?{" "}
            <Link to="/signin" className="text-link">
              Sign In
            </Link>
          </div>
        </div>
      ),
    ],
  };
};
