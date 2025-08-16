import { signInAction } from "@/features/auth/actions";
import { SignInForm } from "@/features/auth/components/SignInForm";

export default function SignInPage() {
  return <SignInForm title="Sign in" submitLabel="Continue" action={signInAction} />;
}