export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Welcome</h1>
      <p>Go to <a className="underline" href="/sign-in">Sign in</a> or <a className="underline" href="/sign-up">Sign up</a>.</p>
    </div>
  );
}