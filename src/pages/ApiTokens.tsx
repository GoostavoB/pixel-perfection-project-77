import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, Trash2, Plus, Eye, EyeOff } from "lucide-react";
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
  const [isCreating, setIsCreating] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenDescription, setNewTokenDescription] = useState("");
  const [revealedTokens, setRevealedTokens] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    const { data, error } = await supabase
      .from("api_tokens")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tokens",
        variant: "destructive",
      });
      return;
    }

    setTokens(data || []);
  };

  const generateToken = () => {
    return `hbc_${Array.from({ length: 32 }, () => 
      Math.random().toString(36)[2] || '0'
    ).join('')}`;
  };

  const createToken = async () => {
    if (!newTokenName.trim()) {
      toast({
        title: "Erro",
        description: "O nome do token é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const token = generateToken();
    const { error } = await supabase
      .from("api_tokens")
      .insert([{
        token,
        name: newTokenName,
        description: newTokenDescription || null,
      }]);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o token",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Token criado!",
      description: "Copie o token agora. Ele não será exibido novamente.",
    });

    setNewTokenName("");
    setNewTokenDescription("");
    setIsCreating(false);
    fetchTokens();
  };

  const deleteToken = async (id: string) => {
    const { error } = await supabase
      .from("api_tokens")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o token",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Token deletado",
      description: "O token foi removido com sucesso",
    });

    fetchTokens();
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({
      title: "Copiado!",
      description: "Token copiado para a área de transferência",
    });
  };

  const toggleReveal = (id: string) => {
    const newRevealed = new Set(revealedTokens);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
    }
    setRevealedTokens(newRevealed);
  };

  const maskToken = (token: string) => {
    return token.substring(0, 8) + '•'.repeat(token.length - 8);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            API Tokens para n8n
          </h1>
          <p className="text-muted-foreground">
            Crie e gerencie tokens de API para integrar com n8n e outras ferramentas externas
          </p>
        </div>

        {!isCreating ? (
          <Button onClick={() => setIsCreating(true)} className="mb-6">
            <Plus className="mr-2 h-4 w-4" />
            Criar Novo Token
          </Button>
        ) : (
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Criar Novo Token</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Token *</Label>
                <Input
                  id="name"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder="Ex: n8n Production"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={newTokenDescription}
                  onChange={(e) => setNewTokenDescription(e.target.value)}
                  placeholder="Descreva o uso deste token"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createToken}>Criar Token</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="text-xl font-bold">Tokens Ativos</h3>
          {tokens.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum token criado ainda</p>
            </Card>
          ) : (
            tokens.map((token) => (
              <Card key={token.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-lg">{token.name}</h4>
                    {token.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {token.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteToken(token.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 bg-muted p-3 rounded-md">
                  <code className="flex-1 text-sm font-mono">
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

                <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                  <span>Criado: {new Date(token.created_at).toLocaleDateString()}</span>
                  {token.last_used_at && (
                    <span>
                      Último uso: {new Date(token.last_used_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        <Card className="mt-8 p-6 bg-primary/5">
          <h3 className="font-bold mb-4">Como usar no n8n:</h3>
          <ol className="space-y-2 text-sm">
            <li>1. Copie o token acima</li>
            <li>2. No n8n, adicione um nó HTTP Request</li>
            <li>3. Configure:</li>
            <ul className="ml-6 space-y-1 text-muted-foreground">
              <li>• URL: <code className="bg-muted px-2 py-1 rounded">https://jafaukblhxbycjzrbkeq.supabase.co/functions/v1/n8n-api/bill-analyses</code></li>
              <li>• Headers: <code className="bg-muted px-2 py-1 rounded">x-api-token: SEU_TOKEN_AQUI</code></li>
            </ul>
            <li className="mt-4">4. Rotas disponíveis:</li>
            <ul className="ml-6 space-y-1 text-muted-foreground">
              <li>• GET /bill-analyses - Listar análises</li>
              <li>• GET /bill-analyses/:id - Obter análise específica</li>
              <li>• POST /bill-analyses - Criar nova análise</li>
              <li>• PATCH /bill-analyses/:id - Atualizar análise</li>
              <li>• DELETE /bill-analyses/:id - Deletar análise</li>
            </ul>
          </ol>
        </Card>
      </div>
    </div>
  );
};

export default ApiTokens;
