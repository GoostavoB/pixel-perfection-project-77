import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database, RefreshCw, TrendingUp, CheckCircle, Clock, Zap, BarChart3, PieChart } from "lucide-react";
import { PerformanceLineChart } from "@/components/analytics/PerformanceLineChart";
import { CoverageDonutChart } from "@/components/analytics/CoverageDonutChart";
import { TrendingCodesTable } from "@/components/analytics/TrendingCodesTable";
import { CostSavingsBarChart } from "@/components/analytics/CostSavingsBarChart";
import { Skeleton } from "@/components/ui/skeleton";

const CacheAdmin = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [trendingCodes, setTrendingCodes] = useState<any[]>([]);
  const [coverageStats, setCoverageStats] = useState<any[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState<any[]>([]);
  const [isPrecaching, setIsPrecaching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const loadStats = async () => {
    setLoading(true);
    try {
      // Get total cached codes
      const { count: totalCached } = await supabase
        .from('medicare_prices')
        .select('*', { count: 'exact', head: true });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentlyUpdated } = await supabase
        .from('medicare_prices')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      const { count: withDescriptions } = await supabase
        .from('medicare_prices')
        .select('*', { count: 'exact', head: true })
        .not('description', 'is', null)
        .neq('description', '');

      setStats({
        totalCached: totalCached || 0,
        recentlyUpdated: recentlyUpdated || 0,
        withDescriptions: withDescriptions || 0,
        dataQuality: totalCached ? Math.round((withDescriptions / totalCached) * 100) : 0
      });
      
      // Load metrics for last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const { data: metricsData } = await supabase
        .from('fair_price_metrics')
        .select('*')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false });
      
      if (metricsData && metricsData.length > 0) {
        const totalRequests = metricsData.length;
        const avgCacheHitRate = metricsData.reduce((sum: number, m: any) => sum + (Number(m.cache_hit_rate) || 0), 0) / totalRequests;
        const avgResponseTime = metricsData.reduce((sum: number, m: any) => sum + (Number(m.response_time_ms) || 0), 0) / totalRequests;
        const totalCostSaved = metricsData.reduce((sum: number, m: any) => sum + (Number(m.estimated_cost_saved) || 0), 0);
        const totalCodesProcessed = metricsData.reduce((sum: number, m: any) => sum + (Number(m.total_codes) || 0), 0);
        const totalApiCalls = metricsData.reduce((sum: number, m: any) => sum + (Number(m.api_calls) || 0), 0);
        const totalErrors = metricsData.reduce((sum: number, m: any) => sum + (Number(m.error_count) || 0), 0);
        
        setMetrics({
          totalRequests,
          avgCacheHitRate: avgCacheHitRate.toFixed(1),
          avgResponseTime: Math.round(avgResponseTime),
          totalCostSaved: totalCostSaved.toFixed(2),
          totalCodesProcessed,
          totalApiCalls,
          totalErrors,
          errorRate: totalCodesProcessed > 0 ? ((totalErrors / totalCodesProcessed) * 100).toFixed(1) : '0.0'
        });
      }

      // Load advanced analytics data
      const { data: trending } = await supabase.functions.invoke('get-analytics-data', {
        body: { endpoint: 'trending' }
      });
      if (trending?.data) setTrendingCodes(trending.data);

      const { data: coverage } = await supabase.functions.invoke('get-analytics-data', {
        body: { endpoint: 'coverage' }
      });
      if (coverage?.data) setCoverageStats(coverage.data);

      const { data: performance } = await supabase.functions.invoke('get-analytics-data', {
        body: { endpoint: 'performance' }
      });
      if (performance?.data) setPerformanceTrends(performance.data);

    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: "Error loading stats",
        description: "Could not fetch cache statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handlePrecache = async () => {
    setIsPrecaching(true);
    try {
      const { data, error } = await supabase.functions.invoke('precache-common-codes');
      
      if (error) throw error;
      
      toast({
        title: "✅ Pre-cache complete!",
        description: `${data.fetched} codes cached, ${data.coverage_percent}% coverage`,
      });
      
      // Reload stats
      await loadStats();
    } catch (error) {
      console.error('Precache error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to pre-cache codes",
        variant: "destructive"
      });
    } finally {
      setIsPrecaching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-96 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Pricing Cache Administration
          </h1>
          <p className="text-muted-foreground">
            Manage and optimize the Medicare pricing data cache
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">
              <Database className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="quality">
              <PieChart className="h-4 w-4 mr-2" />
              Data Quality
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="trending">
              <BarChart3 className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground">
                      {stats?.totalCached || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Cached Codes</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-chart-2/10 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-chart-2" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground">
                      {stats?.dataQuality || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Data Quality</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-chart-3/10 rounded-lg">
                    <Clock className="h-6 w-6 text-chart-3" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground">
                      {stats?.recentlyUpdated || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Updated (7 days)</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-chart-4/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-chart-4" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground">
                      {stats?.withDescriptions || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">With Descriptions</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Data Quality Progress */}
            <Card className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground">Cache Coverage</h3>
                  <Badge variant="outline">{stats?.dataQuality || 0}% Quality</Badge>
                </div>
                <Progress value={stats?.dataQuality || 0} className="h-3" />
              </div>
              <p className="text-sm text-muted-foreground">
                {stats?.withDescriptions || 0} of {stats?.totalCached || 0} cached codes have full descriptions
              </p>
            </Card>

            {/* Performance Metrics (Last 24h) */}
            {metrics && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Performance Analytics (Last 24 Hours)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Requests</div>
                    <div className="text-2xl font-bold text-foreground">{metrics.totalRequests}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {metrics.totalCodesProcessed} codes processed
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Avg Cache Hit Rate</div>
                    <div className="text-2xl font-bold text-chart-2">{metrics.avgCacheHitRate}%</div>
                    <Progress value={parseFloat(metrics.avgCacheHitRate)} className="h-2 mt-2" />
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Avg Response Time</div>
                    <div className="text-2xl font-bold text-chart-3">{metrics.avgResponseTime}ms</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {metrics.totalApiCalls} API calls made
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Cost Savings</div>
                    <div className="text-2xl font-bold text-chart-4">${metrics.totalCostSaved}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {metrics.errorRate}% error rate
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Pre-cache Common Codes</h4>
                      <p className="text-sm text-muted-foreground">
                        Fetch and cache ~100 most commonly used medical procedure codes
                      </p>
                    </div>
                    <Button 
                      onClick={handlePrecache} 
                      disabled={isPrecaching}
                      className="ml-4"
                    >
                      {isPrecaching ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Pre-caching...
                        </>
                      ) : (
                        <>
                          <Database className="mr-2 h-4 w-4" />
                          Start Pre-cache
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Refresh Statistics</h4>
                      <p className="text-sm text-muted-foreground">
                        Reload cache statistics and metrics
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={loadStats}
                      disabled={loading}
                      className="ml-4"
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Info Card */}
            <Card className="p-6 bg-muted/50">
              <h3 className="font-semibold text-foreground mb-2">About Pricing Cache</h3>
              <p className="text-sm text-muted-foreground">
                The pricing cache stores Medicare rates and fair market prices for medical procedures. 
                Pre-caching common codes improves analysis speed by 10-50x for frequently used procedures. 
                Cache entries are automatically refreshed every 30 days to ensure accuracy.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-8">
            {coverageStats.length > 0 && <CoverageDonutChart data={coverageStats} />}
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Coverage by Medical Specialty</h3>
              <div className="space-y-3">
                {coverageStats.map((stat: any) => (
                  <div key={stat.specialty} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{stat.specialty}</span>
                      <span className="text-muted-foreground">
                        {stat.cached_codes}/{stat.total_codes} ({Number(stat.coverage_percent).toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={Number(stat.coverage_percent)} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-8">
            {performanceTrends.length > 0 && <PerformanceLineChart data={performanceTrends} />}
            {performanceTrends.length > 0 && <CostSavingsBarChart data={performanceTrends} />}
          </TabsContent>

          <TabsContent value="trending" className="space-y-8">
            {trendingCodes.length > 0 && <TrendingCodesTable data={trendingCodes} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CacheAdmin;
