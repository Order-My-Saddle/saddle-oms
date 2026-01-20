"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from '@/api/login';

export function LoginHelper() {
  const [username, setUsername] = useState('laurengilbert');
  const [password, setPassword] = useState('welcomeLauren!@');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        setMessage('✅ Login successful! You can now use Edit Order.');
        // Refresh the page to update authentication state
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage(`❌ Login failed: ${result.message}`);
      }
    } catch (error) {
      setMessage(`❌ Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setMessage(`✅ Token found: ${token.substring(0, 20)}...`);
    } else {
      setMessage('❌ No authentication token found');
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-3">Authentication Helper</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Username</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleLogin} 
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          
          <Button 
            onClick={checkToken} 
            variant="outline"
            size="sm"
          >
            Check Token
          </Button>
        </div>
        
        {message && (
          <div className={`text-sm p-2 rounded ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}