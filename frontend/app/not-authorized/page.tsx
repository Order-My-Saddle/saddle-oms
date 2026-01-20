"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { getRoleDisplayName } from '@/utils/rolePermissions';

export default function NotAuthorizedPage() {
  const router = useRouter();
  const { role } = useUserRole();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            You don&apos;t have permission to access this page.
          </p>
          {role && (
            <p className="text-sm text-gray-500">
              Your current role: <span className="font-semibold">{getRoleDisplayName(role)}</span>
            </p>
          )}
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact your administrator.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 bg-[#7b2326] hover:bg-[#8B0000]"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
