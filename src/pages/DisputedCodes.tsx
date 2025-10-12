import { Search, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Header from "@/components/Header";

const commonDisputedCodes = [
  {
    code: "99285",
    description: "Emergency department visit, high complexity",
    commonIssues: ["Often upcoded from lower complexity visits", "Subjective criteria make it easy to overcharge"],
    averageCost: "$800-$1,200",
    tipicallyDisputed: "42%"
  },
  {
    code: "99291",
    description: "Critical care, first hour",
    commonIssues: ["Billed even when critical care criteria not met", "Time documentation often inflated"],
    averageCost: "$600-$1,000",
    tipicallyDisputed: "38%"
  },
  {
    code: "36415",
    description: "Routine venipuncture (blood draw)",
    commonIssues: ["Often duplicated", "Charged separately when should be included"],
    averageCost: "$10-$25",
    tipicallyDisputed: "35%"
  },
  {
    code: "80053",
    description: "Comprehensive metabolic panel",
    commonIssues: ["Billed alongside individual tests that are included", "Duplicate billing common"],
    averageCost: "$30-$80",
    tipicallyDisputed: "31%"
  },
  {
    code: "99283",
    description: "Emergency department visit, moderate complexity",
    commonIssues: ["Upcoded to 99285", "Documentation doesn't support complexity level"],
    averageCost: "$400-$700",
    tipicallyDisputed: "29%"
  },
  {
    code: "71046",
    description: "Chest X-ray, 2 views",
    commonIssues: ["Billed as multiple separate procedures", "Professional and facility fees both charged"],
    averageCost: "$100-$200",
    tipicallyDisputed: "28%"
  },
  {
    code: "81001",
    description: "Urinalysis, manual test",
    commonIssues: ["Charged multiple times for same visit", "Billed when not medically necessary"],
    averageCost: "$10-$30",
    tipicallyDisputed: "27%"
  },
  {
    code: "90471",
    description: "Immunization administration",
    commonIssues: ["Multiple administration fees for same injection", "Facility fee added unnecessarily"],
    averageCost: "$25-$45",
    tipicallyDisputed: "26%"
  },
];

const DisputedCodes = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCodes = commonDisputedCodes.filter(
    (item) =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Most Disputed Medical Codes
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Common CPT codes that frequently contain errors or overcharges
            </p>
          </div>

          <Card className="p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          <div className="grid gap-6">
            {filteredCodes.map((item, index) => (
              <Card
                key={item.code}
                className="p-6 hover:shadow-lg transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary font-mono font-bold rounded text-sm">
                        {item.code}
                      </span>
                      <span className="px-3 py-1 bg-destructive/10 text-destructive font-semibold rounded text-xs">
                        {item.tipicallyDisputed} disputed
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">
                      {item.description}
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">Common Issues:</h4>
                        <ul className="space-y-1">
                          {item.commonIssues.map((issue, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-destructive mt-1">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="md:text-right">
                    <div className="inline-block px-4 py-2 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Typical Cost Range</p>
                      <p className="text-lg font-bold text-foreground">{item.averageCost}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredCodes.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No codes found matching your search. Try a different term.
              </p>
            </Card>
          )}

          <Card className="p-6 md:p-8 mt-8 bg-primary/5 border-primary/20">
            <h3 className="text-xl font-bold text-foreground mb-4">Check Your Bill for These Codes</h3>
            <p className="text-foreground/90 mb-6">
              Upload your medical bill to see if it contains any of these commonly disputed codes and get a detailed analysis of potential overcharges.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DisputedCodes;
