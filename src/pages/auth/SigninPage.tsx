import { FormLayout } from "@/components/form/FormLayout";
import { secAuthMethod } from "@/components/form layout template/secAuthMethod";
import { Checkbox } from "@/components/form/checkbox";
import { VITE_SERVER_URL } from "@/config";
import { useUser } from "@/contexts";
import useForm from "@/hooks/useForm";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { HoshifyLogo } from "@/components/ui/logo";

export const SigninPage = () => {
  const { signIn, loading, setLoading, isSignIn, user } = useUser();
  const navigate = useNavigate();
  const form = useForm({ email: "", password: "" }, { email: { regex: true }, password: { min: 8 } });
  const {
    form: [formVal],
  } = form;

  useEffect(() => {
    if (isSignIn && user.role === "USER") navigate("/");
  }, [isSignIn, navigate, user.role]);

  const handleSubmit = async () => {
    await signIn(formVal);
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
                  {
                    elementType: "custom",
                    render: <Checkbox id="remember-me" className="cursor-pointer" label="Remember Me" />,
                  },
                  { elementType: "link", to: "/forgot-password", className: "text-link", children: "Forgot Password" },
                ],
              },
              { elementType: "separator", label: "OR", afterSubmitButton: true },
              secAuthMethod<typeof formVal>(loading, handleGoogle, "signin"),
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
