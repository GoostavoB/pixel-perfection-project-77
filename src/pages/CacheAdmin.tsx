import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database, RefreshCw, TrendingUp, CheckCircle, Clock, Zap } from "lucide-react";

const CacheAdmin = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [isPrecaching, setIsPrecaching] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Get total cached codes
      const { count: totalCached } = await supabase
        .from('medicare_prices')
        .select('*', { count: 'exact', head: true });

      // Get recently updated codes (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentlyUpdated } = await supabase
        .from('medicare_prices')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Get codes with descriptions (higher quality data)
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
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
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
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
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
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
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
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
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
        <Card className="p-6 mb-8">
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

        {/* Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
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
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">About Pricing Cache</h3>
          <p className="text-sm text-blue-800">
            The pricing cache stores Medicare rates and fair market prices for medical procedures. 
            Pre-caching common codes improves analysis speed by 10-50x for frequently used procedures. 
            Cache entries are automatically refreshed every 30 days to ensure accuracy.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default CacheAdmin;
