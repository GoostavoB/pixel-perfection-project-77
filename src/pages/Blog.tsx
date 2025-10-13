import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

const blogPosts = [
  {
    slug: "remove-medical-bills-credit",
    title: "How to Remove Medical Bills from Your Credit Report",
    excerpt: "Step-by-step guide to disputing medical collections and removing them from your credit report using proven strategies.",
    category: "Credit & Debt",
    readTime: "8 min read",
    date: "October 12, 2025",
  },
  {
    slug: "medical-debt-credit-impact",
    title: "Medical Debt and Your Credit Report: What You Need to Know",
    excerpt: "Understanding how medical bills affect your credit score, FICO scoring models, and recent policy changes.",
    category: "Credit & Debt",
    readTime: "7 min read",
    date: "October 10, 2025",
  },
  {
    slug: "how-long-medical-bills-stay",
    title: "How Long Do Medical Bills Stay on Your Credit Report?",
    excerpt: "Complete timeline guide from billing to removal, plus strategies to remove medical debt before 7 years.",
    category: "Credit & Debt",
    readTime: "6 min read",
    date: "October 8, 2025",
  },
  {
    slug: "no-surprises-act-guide",
    title: "The No Surprises Act: Your Complete Guide",
    excerpt: "Learn how federal law protects you from unexpected medical bills and what to do if you receive one.",
    category: "Legal Rights",
    readTime: "7 min read",
    date: "October 8, 2025",
  },
  {
    slug: "remove-medical-bills-credit",
    title: "How to Remove Medical Bills from Your Credit Report",
    excerpt: "Step-by-step guide to disputing medical collections and improving your credit score.",
    category: "Credit & Debt",
    readTime: "6 min read",
    date: "October 5, 2025",
  },
  {
    slug: "hospital-bill-errors",
    title: "Top 10 Most Common Hospital Billing Errors",
    excerpt: "Discover the billing mistakes that affect 80% of medical bills and cost patients thousands.",
    category: "Billing Errors",
    readTime: "8 min read",
    date: "October 3, 2025",
  },
  {
    slug: "understand-medical-codes",
    title: "Understanding Medical Billing Codes: CPT, DRG, and HCPCS",
    excerpt: "Demystify the complex world of medical coding and learn how to read your hospital bill.",
    category: "Education",
    readTime: "10 min read",
    date: "September 28, 2025",
  },
  {
    slug: "emergency-room-charges",
    title: "Why Emergency Room Charges Are So High",
    excerpt: "Breaking down the costs of emergency care and how to identify overcharges.",
    category: "Healthcare Costs",
    readTime: "6 min read",
    date: "September 25, 2025",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Medical Billing Blog
          </h1>
          <p className="text-lg text-muted-foreground">
            Expert insights on medical billing, healthcare costs, and protecting your rights
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          {blogPosts.map((post, index) => (
            <Card
              key={post.slug}
              className="p-6 hover:shadow-lg transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
                    {post.category}
                  </span>
                  <h2 className="text-xl font-bold text-foreground mb-2 hover:text-primary transition-colors">
                    <Link to={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readTime}
                    </span>
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <Button variant="ghost" size="sm" className="group">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Blog;
