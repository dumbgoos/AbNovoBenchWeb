"use client";

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from "lucide-react";

interface NetworkStatusProps {
  showDetails?: boolean;
  onConnectionChange?: (isConnected: boolean) => void;
}

interface ConnectionTest {
  name: string;
  url: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  responseTime?: number;
}

export default function NetworkStatus({ showDetails = false, onConnectionChange }: NetworkStatusProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [tests, setTests] = useState<ConnectionTest[]>([
    { name: 'Frontend Health', url: '/api/health', status: 'pending' },
    { name: 'Backend Direct', url: 'http://localhost:5000/api/health', status: 'pending' },
    { name: 'Auth Service', url: '/api/auth/verify', status: 'pending' }
  ]);

  const testConnection = async (test: ConnectionTest): Promise<ConnectionTest> => {
    const startTime = Date.now();
    try {
      const response = await fetch(test.url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          ...test,
          status: 'success',
          message: `Response OK (${response.status})`,
          responseTime
        };
      } else {
        return {
          ...test,
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          responseTime
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      let message = 'Connection failed';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          message = 'Request timeout (>5s)';
        } else if (error.message.includes('fetch')) {
          message = 'Network connection error';
        } else {
          message = error.message;
        }
      }
      
      return {
        ...test,
        status: 'error',
        message,
        responseTime
      };
    }
  };

  const runNetworkTests = async () => {
    setIsChecking(true);
    
    const testPromises = tests.map(testConnection);
    const results = await Promise.all(testPromises);
    
    setTests(results);
    setLastCheck(new Date());
    setIsChecking(false);
    
    // Check if any critical tests passed
    const healthPassed = results.some(test => 
      test.url.includes('/health') && test.status === 'success'
    );
    
    setIsConnected(healthPassed);
    onConnectionChange?.(healthPassed);
  };

  useEffect(() => {
    runNetworkTests();
    
    // Set up periodic checks every 30 seconds
    const interval = setInterval(runNetworkTests, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
    return isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (isChecking) return 'text-blue-600';
    return isConnected ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Connection Status Summary */}
      <Alert className={`border-l-4 ${isConnected ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
        <div className={getStatusColor()}>
          {getStatusIcon()}
        </div>
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span className="font-medium">
              Network Status: {isChecking ? 'Checking...' : isConnected ? 'Connected' : 'Connection Error'}
            </span>
            <div className="flex items-center space-x-2">
              {lastCheck && (
                <span className="text-xs text-gray-500">
                  Last Check: {lastCheck.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={runNetworkTests}
                disabled={isChecking}
                className="h-6 px-2"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Detailed Connection Tests */}
      {showDetails && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Connection Test Details</h4>
          {tests.map((test, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  ${test.status === 'success' ? 'text-green-600' : 
                    test.status === 'error' ? 'text-red-600' : 'text-gray-400'}
                `}>
                  {test.status === 'success' ? <CheckCircle className="w-4 h-4" /> :
                   test.status === 'error' ? <XCircle className="w-4 h-4" /> :
                   <RefreshCw className="w-4 h-4 animate-spin" />}
                </div>
                <div>
                  <div className="text-sm font-medium">{test.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{test.url}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm ${
                  test.status === 'success' ? 'text-green-600' : 
                  test.status === 'error' ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {test.message || 'Waiting...'}
                </div>
                {test.responseTime && (
                  <div className="text-xs text-gray-500">
                    {test.responseTime}ms
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 