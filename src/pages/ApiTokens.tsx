import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Key, Copy, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import Header from "@/components/Header";

interface ApiToken {
  id: string;
  token: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

const ApiTokens = () => {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [revealedTokens, setRevealedTokens] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    try {
      const { data, error } = await supabase
        .from("api_tokens")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading tokens",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = 'hbc_';
    for (let i = 0; i < 48; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const createToken = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for the token",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = generateToken();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("api_tokens").insert({
        token,
        name,
        description,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Token created",
        description: "Copy the token now - it will not be shown again!",
      });

      setName("");
      setDescription("");
      setShowForm(false);
      loadTokens();
    } catch (error: any) {
      toast({
        title: "Error creating token",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteToken = async (id: string) => {
    if (!confirm("Are you sure you want to delete this token?")) return;

    try {
      const { error } = await supabase.from("api_tokens").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Token deleted",
        description: "The token was successfully removed",
      });
      loadTokens();
    } catch (error: any) {
      toast({
        title: "Error deleting token",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleReveal = (tokenId: string) => {
    setRevealedTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tokenId)) {
        newSet.delete(tokenId);
      } else {
        newSet.add(tokenId);
      }
      return newSet;
    });
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({
      title: "Token copied",
      description: "The token was copied to clipboard",
    });
  };

  const maskToken = (token: string) => {
    const prefix = token.substring(0, 8);
    return `${prefix}${'•'.repeat(40)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">API Tokens</h1>
            <p className="text-muted-foreground">
              Manage API tokens for integration with n8n and other tools
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Token
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Token</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Token Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: n8n Production"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will this token be used for?"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createToken}>Create Token</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {tokens.length === 0 ? (
            <Card className="p-12 text-center">
              <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No tokens created</h3>
              <p className="text-muted-foreground mb-4">
                Create your first API token for n8n integration
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Token
              </Button>
            </Card>
          ) : (
            tokens.map((token) => (
              <Card key={token.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{token.name}</h3>
                    {token.description && (
                      <p className="text-sm text-muted-foreground mb-3">{token.description}</p>
                    )}
                    
                    <div className="bg-muted p-3 rounded font-mono text-sm mb-3 flex items-center gap-2">
                      <code className="flex-1">
                        {revealedTokens.has(token.id) ? token.token : maskToken(token.token)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReveal(token.id)}
                      >
                        {revealedTokens.has(token.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToken(token.token)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Created: {new Date(token.created_at).toLocaleDateString()}</span>
                      {token.last_used_at && (
                        <span>Last used: {new Date(token.last_used_at).toLocaleDateString()}</span>
                      )}
                      <span className={token.is_active ? "text-green-600" : "text-red-600"}>
                        {token.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteToken(token.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        <Card className="p-6 mt-8 bg-muted/50">
          <h3 className="font-semibold mb-3">How to use with n8n</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-1">API URL:</p>
              <code className="bg-background p-2 rounded block">
                https://jafaukblhxbycjzrbkeq.supabase.co/functions/v1/n8n-api
              </code>
            </div>
            
            <div>
              <p className="font-medium mb-1">Required headers:</p>
              <code className="bg-background p-2 rounded block">
                X-API-Token: your_token_here<br/>
                Content-Type: application/json
              </code>
            </div>

            <div>
              <p className="font-medium mb-1">Example (SELECT):</p>
              <pre className="bg-background p-2 rounded block overflow-x-auto">
{`{
  "action": "select",
  "table": "bill_analyses",
  "filters": {
    "status": "completed"
  }
}`}
              </pre>
            </div>

            <div>
              <p className="font-medium mb-1">Actions:</p>
              <code className="text-xs">select, insert, update, delete</code>
            </div>

            <div>
              <p className="font-medium mb-1">Tables:</p>
              <code className="text-xs">bill_analyses, analysis_results, jobs, user_form_data, dispute_letters</code>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ApiTokens;
