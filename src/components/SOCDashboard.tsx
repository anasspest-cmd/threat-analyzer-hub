import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserMenu } from "@/components/auth/UserMenu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportsTab } from "@/components/reports/ReportsTab";
import { 
  Shield, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Server, 
  FileText,
  History,
  Settings,
  Monitor,
  Eye,
  TrendingUp,
  Zap,
  Loader2
} from "lucide-react";
import { AIAssistant } from "@/components/AIAssistant";

const SOCDashboard = () => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  // Fetch clients data
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch all logs and assets for dashboard overview
  const { data: allLogs = [] } = useQuery({
    queryKey: ['all-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: allAssets = [] } = useQuery({
    queryKey: ['all-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch assets data for selected client
  const { data: assets = [] } = useQuery({
    queryKey: ['assets', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('client_id', selectedClient)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedClient
  });

  // Fetch logs data for selected client
  const { data: logs = [] } = useQuery({
    queryKey: ['logs', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('client_id', selectedClient)
        .order('timestamp', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedClient
  });

  // Calculate stats from real data
  const totalAlerts = logs.filter(log => log.severity === 'high' || log.severity === 'critical').length;
  const totalAssets = assets.length;
  const onlineAssets = assets.filter(asset => asset.status === 'online').length;

  if (clientsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading SOC Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!selectedClient) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-primary">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    SOC Command Center
                  </h1>
                  <p className="text-muted-foreground text-sm">Security Operations Dashboard</p>
                </div>
              </div>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Dashboard */}
        <main className="container mx-auto px-6 py-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-soc-primary/20 bg-gradient-to-br from-card to-soc-surface">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-soc-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-soc-primary">{clients.length}</div>
                <p className="text-xs text-muted-foreground">Active monitoring</p>
              </CardContent>
            </Card>

            <Card className="border-soc-danger/20 bg-gradient-to-br from-card to-soc-surface">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-soc-danger" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-soc-danger">
                  {allLogs.filter(log => log.severity === 'high' || log.severity === 'critical').length}
                </div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>

            <Card className="border-soc-success/20 bg-gradient-to-br from-card to-soc-surface">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Protected Assets</CardTitle>
                <CheckCircle className="h-4 w-4 text-soc-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-soc-success">
                  {allAssets.length}
                </div>
                <p className="text-xs text-muted-foreground">Under monitoring</p>
              </CardContent>
            </Card>

            <Card className="border-soc-accent/20 bg-gradient-to-br from-card to-soc-surface">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Activity className="h-4 w-4 text-soc-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-soc-accent">99.8%</div>
                <p className="text-xs text-muted-foreground">System availability</p>
              </CardContent>
            </Card>
          </div>

          {/* Client Selection */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Clients
              </CardTitle>
              <CardDescription>
                Select a client to access their security workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((client) => {
                  // Get client-specific stats
                  const clientAssets = allAssets.filter(asset => asset.client_id === client.id).length;
                  const clientAlerts = allLogs
                    .filter(log => log.client_id === client.id && (log.severity === 'high' || log.severity === 'critical'))
                    .length;
                  
                  return (
                    <Card 
                      key={client.id} 
                      className="cursor-pointer transition-all duration-300 hover:shadow-glow hover:border-primary/50 bg-gradient-surface"
                      onClick={() => setSelectedClient(client.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{client.name}</CardTitle>
                          <Badge 
                            variant="default"
                            className="bg-soc-success"
                          >
                            active
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Active Alerts</span>
                          <span className={clientAlerts > 0 ? "text-soc-danger font-medium" : "text-soc-success"}>
                            {clientAlerts}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Protected Assets</span>
                          <span className="text-soc-accent font-medium">{clientAssets}</span>
                        </div>
                        <Button className="w-full mt-4 bg-gradient-primary hover:opacity-90">
                          <Eye className="h-4 w-4 mr-2" />
                          Access Workspace
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const selectedClientData = clients.find(c => c.id === selectedClient);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedClient(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back to Clients
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-primary">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{selectedClientData?.name}</h1>
                  <p className="text-muted-foreground text-sm">Security Workspace</p>
                </div>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Client Workspace */}
      <main className="container mx-auto px-6 py-6">
        <Tabs defaultValue="monitor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5 bg-card border border-border">
            <TabsTrigger value="monitor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Monitor className="h-4 w-4 mr-2" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Server className="h-4 w-4 mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Zap className="h-4 w-4 mr-2" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-3 shadow-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-soc-primary" />
                    Live Classifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {logs.slice(0, 5).map((log) => {
                      const getBadgeColor = (label: string) => {
                        switch (label) {
                          case 'TP': return 'bg-soc-success';
                          case 'TN': return 'bg-soc-success';
                          case 'FP': return 'bg-soc-danger';
                          case 'FN': return 'bg-soc-warning';
                          default: return 'bg-gray-500';
                        }
                      };

                      const getBadgeText = (label: string) => {
                        switch (label) {
                          case 'TP': return 'True Positive';
                          case 'TN': return 'True Negative';
                          case 'FP': return 'False Positive';
                          case 'FN': return 'False Negative';
                          default: return 'Unknown';
                        }
                      };

                      return (
                        <div key={log.event_id} className="flex items-center justify-between p-3 rounded-lg bg-soc-surface border border-border/20">
                          <div>
                            <div className="font-medium">{log.alert_name || log.event_type}</div>
                            <div className="text-sm text-muted-foreground">
                              {log.host_ip} - {log.host_name || 'Unknown Host'}
                            </div>
                          </div>
                          <Badge className={getBadgeColor(log.label)}>
                            {getBadgeText(log.label)}
                          </Badge>
                        </div>
                      );
                    })}
                    {logs.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No recent classifications available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-assistant" className="space-y-6">
            <AIAssistant 
              clientId={selectedClient}
              clientName={selectedClientData?.name}
            />
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Asset Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Assets</span>
                    <span className="font-bold text-soc-accent">{totalAssets}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Online</span>
                    <span className="font-bold text-soc-success">{onlineAssets}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Offline</span>
                    <span className="font-bold text-soc-danger">{totalAssets - onlineAssets}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="md:col-span-2 lg:col-span-3">
                <Card className="shadow-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      Asset Inventory
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {assets.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Asset Name</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Vulnerabilities</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assets.map((asset) => (
                            <TableRow key={asset.id}>
                              <TableCell className="font-medium">{asset.name}</TableCell>
                              <TableCell>{asset.ip_address}</TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    asset.status === 'online' ? 'bg-soc-success' :
                                    asset.status === 'offline' ? 'bg-soc-danger' :
                                    'bg-soc-warning'
                                  }
                                >
                                  {asset.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {Array.isArray(asset.vulnerabilities) && asset.vulnerabilities.length > 0 ? (
                                  <Badge variant="destructive">
                                    {asset.vulnerabilities.length} vulnerabilities
                                  </Badge>
                                ) : (
                                  <Badge className="bg-soc-success">Clean</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No assets found for this client
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsTab 
              clientName={selectedClientData?.name || 'Unknown Client'}
              logs={logs}
              assets={assets}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Event History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Historical event analysis and search coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SOCDashboard;