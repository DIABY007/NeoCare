"use client";

import { useState } from "react";
import { OTPLoginForm } from "@/components/auth/otp-login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">NeoCare</h1>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous avec votre numéro de téléphone
          </p>
        </div>
        <OTPLoginForm />
      </div>
    </div>
  );
}

