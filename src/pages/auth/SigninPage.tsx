import { FormLayout } from "@/components/form-layout/FormLayout";
import { VITE_SERVER_URL } from "@/config";
import { useUser } from "@/contexts";
import useForm from "@/hooks/useForm";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { HoshifyLogo } from "@/components/ui/Logo";

export const SigninPage = () => {
  const { signIn, loading, setLoading, isSignIn, user } = useUser();
  const navigate = useNavigate();
  const form = useForm({ email: "", password: "", rememberMe: false }, { email: { regex: true }, password: { min: 8 } });
  const {
    form: [formVal],
  } = form;

  useEffect(() => {
    if (isSignIn && user.role === "USER") navigate("/");
  }, [isSignIn, navigate, user.role]);

  const handleSubmit = async () => {
    await signIn.exec(formVal);
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
            <h1 className="mt-3 text-xl font-semibold tracking-tight">Sign In</h1>
            <p className="text-sm text-muted-foreground">Welcome back to Hoshify</p>
          </div>
          <FormLayout form={form} onFormSubmit={handleSubmit}>
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
            <FormLayout.direction direction={"row"} className="justify-between flex text-sm">
              <FormLayout.checkbox label="Remember me" fieldId="rememberMe" />
              <Link to={"/forgot-password"} className="text-link">
                Forgot password
              </Link>
            </FormLayout.direction>
            <FormLayout.submit variant={"default"} disabled={loading}>
              Sign In
            </FormLayout.submit>
            <FormLayout.separator>OR</FormLayout.separator>
            <FormLayout.templates.SecAuthMethod handleGoogle={handleGoogle} loading={loading} type="signin" />
          </FormLayout>
        </div>
      </div>
    </div>
  );
};
