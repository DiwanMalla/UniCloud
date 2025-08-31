"use client";

import { signIn, getProviders } from "next-auth/react";
import { useState, useEffect } from "react";
import { Github } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(
    null
  );

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    setAuthProviders();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Secure University File Storage
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Store your university files securely in the cloud
          </p>
        </div>
        <div className="mt-8 space-y-6">
          {providers &&
            Object.values(providers).map((provider: Provider) => (
              <div key={provider.name}>
                <button
                  onClick={() => signIn(provider.id, { callbackUrl: "/" })}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <Github className="w-5 h-5 mr-2" />
                  Sign in with {provider.name}
                </button>
              </div>
            ))}
        </div>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Free & Secure Cloud Storage
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
