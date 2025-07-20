import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Info } from "lucide-react";
import { HealthApi, AuthApi } from '@/lib/api';

interface HealthCheckResult {
  endpoint: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  data?: unknown;
}

const ApiTester = () => {
  const [results, setResults] = useState<HealthCheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (endpoint: string, status: HealthCheckResult['status'], message: string, data?: unknown) => {
    setResults(prev => {
      const filtered = prev.filter(r => r.endpoint !== endpoint);
      return [...filtered, { endpoint, status, message, data }];
    });
  };

  const testEndpoint = async (name: string, testFn: () => Promise<unknown>) => {
    updateResult(name, 'loading', 'Testando...');
    try {
      const result = await testFn();
      updateResult(name, 'success', 'Conectado com sucesso', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      updateResult(name, 'error', message);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    const tests = [
      { name: 'Health Check', fn: () => HealthApi.checkHealth() },
      { name: 'Detailed Health', fn: () => HealthApi.checkDetailedHealth() },
      { name: 'Instance Info', fn: () => HealthApi.getInstanceInfo() },
      { name: 'Pod Name', fn: () => HealthApi.getPodName() },
    ];

    for (const test of tests) {
      await testEndpoint(test.name, test.fn);
      // Pequena pausa entre os testes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const testAuth = async () => {
    try {
      updateResult('Token Info', 'loading', 'Testando autenticação...');
      const tokenInfo = await AuthApi.getTokenInfo();
      updateResult('Token Info', 'success', 'Token válido', tokenInfo);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro na autenticação';
      updateResult('Token Info', 'error', message);
    }
  };

  const getStatusIcon = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Testando...</Badge>;
      case 'success':
        return <Badge className="bg-green-500">Sucesso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Teste de Conectividade da API
          </CardTitle>
          <CardDescription>
            Teste a conectividade com a API FastTechFoods em http://localhost:5271
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                'Testar API'
              )}
            </Button>
            
            <Button 
              onClick={testAuth} 
              variant="outline"
              className="flex items-center gap-2"
            >
              Testar Autenticação
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Resultados dos Testes:</h4>
              {results.map((result, index) => (
                <Alert key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.endpoint}</div>
                      <AlertDescription className="text-sm">
                        {result.message}
                      </AlertDescription>
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </Alert>
              ))}
            </div>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Certifique-se de que a API FastTechFoods esteja rodando em http://localhost:5271 antes de executar os testes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTester;
