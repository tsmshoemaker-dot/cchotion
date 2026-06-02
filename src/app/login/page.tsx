"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid username or password");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#f3f2f1] dark:bg-[#1b1a1a]">
      <div className="w-full max-w-sm">
        <div className="border border-[#e1dfdd] dark:border-[#3b3a39] p-8 bg-white dark:bg-[#252526]">
          <h1 className="text-xl font-semibold text-center mb-1 text-[#323130] dark:text-[#e1dfdd]">
            Cchotion
          </h1>
          <p className="text-xs text-center text-[#8a8886] mb-6">
            Sign in
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                name="username"
                type="text"
                placeholder="Username"
                required
                className="w-full px-3 py-2 text-sm border border-[#e1dfdd] dark:border-[#3b3a39] bg-white dark:bg-[#1b1a1a] text-[#323130] dark:text-[#e1dfdd] placeholder-[#8a8886] focus:outline-none focus:border-[#0078d4] dark:focus:border-[#0078d4]"
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="w-full px-3 py-2 text-sm border border-[#e1dfdd] dark:border-[#3b3a39] bg-white dark:bg-[#1b1a1a] text-[#323130] dark:text-[#e1dfdd] placeholder-[#8a8886] focus:outline-none focus:border-[#0078d4] dark:focus:border-[#0078d4]"
              />
            </div>

            {error && (
              <p className="text-xs text-[#d92c2c] text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-[#0078d4] text-white hover:bg-[#005a9e] transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn size={15} />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
