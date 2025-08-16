import { AuthForm } from "@/features/auth/components/AuthForm";
import { signUpAction } from "@/features/auth/actions";
import { SignUpForm } from "@/features/auth/components/SignUpForm";

export default function SignUpPage() {
  return <SignUpForm title="Create account" submitLabel="Continue" action={signUpAction} />;
}