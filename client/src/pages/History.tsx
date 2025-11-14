import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { FileDown, LogOut, Crown, Calendar, FileText, Briefcase, ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import type { ResumeSession } from "@shared/schema";

export default function History() {
  const [, setLocation] = useLocation();
  const [sessions, setSessions] = useState<ResumeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const isPro = user?.accountTier === 'pro';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/user/sessions');
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const data = await response.json();
        // Sort by most recent first
        const sortedData = data.sort((a: ResumeSession, b: ResumeSession) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setSessions(sortedData);
      } catch (error: any) {
        toast({
          title: "Failed to load history",
          description: error.message || "Could not fetch your resume sessions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated, authLoading, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleViewSession = (sessionId: string) => {
    // Navigate to home with session loaded
    setLocation(`/?session=${sessionId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileDown className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Resume Tailor</h1>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <Badge
                  variant={isPro ? "default" : "secondary"}
                  className="gap-1"
                >
                  {isPro && <Crown className="h-3 w-3" />}
                  {isPro ? "Pro" : "Free"}
                </Badge>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
              </>
            )}
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Resume History</h2>
              <p className="text-muted-foreground mt-2">
                View and manage your previously tailored resumes
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-2 text-muted-foreground">Loading your history...</p>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No resume history yet</h3>
                  <p className="text-muted-foreground mt-1">
                    Upload and tailor your first resume to see it here
                  </p>
                </div>
                <Button onClick={() => setLocation('/')}>
                  Get Started
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {session.fileName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(session.createdAt)}
                          </span>
                          {session.tailoredContent && (
                            <Badge variant="secondary" className="text-xs">
                              Tailored
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSession(session.id)}
                        disabled={!session.tailoredContent}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardHeader>
                  {session.jobDescription && (
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          Job Description
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">
                          {truncateText(session.jobDescription, 200)}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
