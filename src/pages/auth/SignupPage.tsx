import { FormLayout } from "@/components/form-layout/FormLayout";
import { VITE_SERVER_URL } from "@/config";
import { useUser } from "@/contexts";
import useForm from "@/hooks/useForm";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { HoshifyLogo } from "@/components/Logo";
import { omit } from "@/utils/manipulate/object";

export const SignupPage = () => {
  const { signUp, loading, setLoading, isSignIn, user } = useUser();
  const navigate = useNavigate();
  const form = useForm(
    { email: "", password: "", fullName: "", verifyPassword: "", rememberMe: false },
    { email: { regex: true }, password: { min: 8 }, fullName: true, verifyPassword: true }
  );
  const {
    form: [formVal],
  } = form;

  useEffect(() => {
    if (isSignIn && user.role === "USER") navigate("/");
  }, [isSignIn, navigate, user.role]);

  const handleSubmit = async () => {
    await signUp.exec(omit(formVal, ["verifyPassword"]));
    navigate("/");
  };

  const handleGoogle = async () => {
    setLoading(true);
    window.location.href = `${VITE_SERVER_URL}/auth/google`;
    setLoading(false);
  };

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
          <FormLayout form={form} onFormSubmit={handleSubmit}>
            <FormLayout.input size="sm" focusRing={true} classLabel="bg-card" placeholder="Your full name" label="Full Name" fieldId="fullName" />
            <FormLayout.input size="sm" focusRing={true} classLabel="bg-card" placeholder="Your email" label="email" fieldId="email" />
            <FormLayout.input
              size="sm"
              focusRing={true}
              classLabel="bg-card"
              placeholder="Your password"
              label="password"
              fieldId="password"
              type="password"
            />
            <FormLayout.input
              size="sm"
              focusRing={true}
              classLabel="bg-card"
              placeholder="Confirm your password"
              label="Confirm Password"
              fieldId="verifyPassword"
              type="password"
            />
            <FormLayout.submit variant={"default"}>Sign Up</FormLayout.submit>
            <FormLayout.checkbox label="Remember me" className="text-sm" fieldId="rememberMe" />
            <FormLayout.separator>OR</FormLayout.separator>
            <FormLayout.templates.SecAuthMethod handleGoogle={handleGoogle} loading={loading} type="signup" />
          </FormLayout>
        </div>
      </div>
    </div>
  );
};
