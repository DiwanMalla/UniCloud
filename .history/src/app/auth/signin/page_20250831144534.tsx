"use client";
import { getProviders, signIn } from "next-auth/react";

import { useEffect, useState } from "react";

export default function SignIn() {
  const [providers, setProviders] = useState<any>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const response = await getProviders();
      setProviders(response);
    };
    fetchProviders();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">Sign in to your account</h1>
      {providers &&
        Object.values(providers).map((provider: any) => (
          <div key={provider.name} className="mb-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => signIn(provider.id)}
            >
              Sign in with {provider.name}
            </button>
          </div>
        ))}
    </div>
  );
}
