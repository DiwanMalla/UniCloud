"use client";

import { signIn, getProviders } from "next-auth/react";
import { useState, useEffect } from "react";
import { Github, Shield, X } from "lucide-react";

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
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    setAuthProviders();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Developer Button - Fixed Position */}
      <button
        onClick={() => setShowDeveloperModal(true)}
        className="fixed top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 z-10"
        title="Developer Info"
      >
        <Shield className="w-4 h-4" />
        Developer
      </button>

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

      {/* Developer Info Modal */}
      {showDeveloperModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Developer Info</h3>
              <button
                onClick={() => setShowDeveloperModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Diwan Malla</h4>
                <p className="text-gray-600 mb-4">Full-Stack Developer</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">About UniCloud</h5>
                <p className="text-sm text-gray-600 mb-3">
                  A secure, encrypted file storage platform built specifically for university students. 
                  Features AES-256 encryption, subject-based organization, and beautiful UI.
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white rounded p-3 border border-gray-200">
                    <div className="font-semibold text-gray-900">Framework:</div>
                    <div className="text-blue-600 font-medium">Next.js 15</div>
                  </div>
                  <div className="bg-white rounded p-3 border border-gray-200">
                    <div className="font-semibold text-gray-900">Database:</div>
                    <div className="text-green-600 font-medium">Supabase</div>
                  </div>
                  <div className="bg-white rounded p-3 border border-gray-200">
                    <div className="font-semibold text-gray-900">Auth:</div>
                    <div className="text-purple-600 font-medium">GitHub OAuth</div>
                  </div>
                  <div className="bg-white rounded p-3 border border-gray-200">
                    <div className="font-semibold text-gray-900">Encryption:</div>
                    <div className="text-red-600 font-medium">AES-256</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href="https://github.com/DiwanMalla"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  View GitHub Profile
                </a>
                <a
                  href="https://github.com/DiwanMalla/UniCloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  View Project Repository
                </a>
              </div>
              
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  Built with ❤️ for university students worldwide
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  © 2025 UniCloud. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
