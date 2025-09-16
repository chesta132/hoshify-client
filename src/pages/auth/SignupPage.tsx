import { FormLayout } from "@/components/form/FormLayout";
import { secAuthMethod } from "@/components/form layout template/secAuthMethod";
import { Checkbox } from "@/components/ui/checkbox";
import { VITE_SERVER_URL } from "@/config";
import { useUser } from "@/contexts";
import useForm from "@/hooks/useForm";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { HoshifyLogo } from "@/components/ui/logo";
import { omit } from "@/utils/manipulate/object";

export const SignupPage = () => {
  const { signUp, loading, setLoading, isSignIn, user } = useUser();
  const navigate = useNavigate();
  const form = useForm(
    { email: "", password: "", fullName: "", verifyPassword: "" },
    { email: { regex: true }, password: { min: 8 }, fullName: true, verifyPassword: true }
  );
  const {
    form: [formVal],
  } = form;

  useEffect(() => {
    if (isSignIn && user.role === "USER") navigate("/");
  }, [isSignIn, navigate, user.role]);

  const handleSubmit = async () => {
    await signUp(omit(formVal, ["verifyPassword"]));
    navigate("/");
  };

  const handleGoogle = async () => {
    setLoading(true);
    window.location.href = `${VITE_SERVER_URL}/auth/google`;
    setLoading(false);
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
              <HoshifyLogo />
            </div>
            <h1 className="mt-3 text-xl font-semibold tracking-tight">Sign Up</h1>
            <p className="text-sm text-muted-foreground">Sign up to sync your data across devices</p>
          </div>

          <FormLayout
            items={[
              {
                ...inputField,
                placeholder: "Your full name",
                label: "Full Name",
                fieldId: "fullName",
              },
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
                ...inputField,
                placeholder: "Confirm your password",
                label: "Confirm Password",
                fieldId: "verifyPassword",
                type: "password",
              },
              <div className="flex items-center gap-2 text-sm">
                <Checkbox id="remember-me" className="cursor-pointer" />
                <label htmlFor="remember-me" className="cursor-pointer">
                  Remember Me
                </label>
              </div>,
              { elementType: "separator", label: "OR", afterSubmitButton: true },
              secAuthMethod<typeof formVal>(loading, handleGoogle, "signup"),
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
