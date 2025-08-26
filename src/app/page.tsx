import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MessageSquare, Target, ArrowRight, CheckCircle, Star } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 text-sm">
              🚀 Now in Beta
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
              Nexus: Your AI for Life, Goals, and Productivity
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Transform chaos into clarity with intelligent scheduling, collaborative chat, and goal-oriented AI assistants. 
              Nexus learns from you to create the perfect plan for every aspect of your life.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/demo">
                <Button size="lg" className="px-8">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
          </div>
          
          {/* Hero Image/Animation Placeholder */}
          <div className="mt-16 flex justify-center">
            <div className="relative h-64 w-full max-w-4xl rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-1 shadow-2xl">
              <div className="h-full w-full rounded-2xl bg-white dark:bg-slate-900 p-8">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      AI-Powered Life Management
                    </div>
                    <div className="mt-2 text-slate-600 dark:text-slate-300">
                      Experience the future of productivity
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Nexus combines powerful AI features to help you achieve your goals and maximize your productivity.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Intelligent Scheduling Card */}
            <Card className="relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">Intelligent Scheduling</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Automatically schedule your life, not just your meetings. Nexus learns from you to create the perfect plan based on your priorities, goals, and energy levels.
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Priority-based optimization</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Time zone awareness</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Google Calendar sync</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collaborative Chat Card */}
            <Card className="relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                    <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-xl">Collaborative Chat</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Coordinate effortlessly with your team or partner, no matter the time zone. Send a "date night" request and let Nexus handle the rest.
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Real-time collaboration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Smart scheduling suggestions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Context-aware conversations</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goal-Oriented Assistants Card */}
            <Card className="relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                    <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl">Goal-Oriented Assistants</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Define your dreams, from career shifts to fitness goals. Nexus provides a step-by-step roadmap and keeps you on track.
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Progress tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Milestone planning</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Adaptive recommendations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              How Nexus Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Three simple steps to transform your productivity and achieve your goals.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-slate-100">Talk</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Chat with Nexus about your goals, schedule, and preferences. Our AI understands natural language and context.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-slate-100">Nexus Learns</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                The AI analyzes your input, understands your intent, and learns from your patterns and preferences over time.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-slate-100">Achieve</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Your schedule is optimized, goals are broken down into actionable steps, and you're on the path to success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Start free and upgrade as you grow. No hidden fees.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Free Tier */}
            <Card className="relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Free</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-slate-600 dark:text-slate-300">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic scheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>3 active goals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Personal chat only</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic AI assistance</span>
                  </li>
                </ul>
                <Link href="/demo">
                  <Button variant="outline" className="mt-6 w-full">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Tier */}
            <Card className="relative overflow-hidden border-2 border-blue-500 bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-blue-500 text-white">Most Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Premium</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-slate-600 dark:text-slate-300">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Advanced AI scheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Unlimited goals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Team collaboration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Google Calendar sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Link href="/demo">
                  <Button className="mt-6 w-full">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Lifetime Access */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-5 w-5" />
                  <CardTitle className="text-xl">Founders' Lifetime</CardTitle>
                  <Star className="h-5 w-5" />
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$299</span>
                  <span className="text-purple-100">/one-time</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-white" />
                    <span>Everything in Premium</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-white" />
                    <span>Lifetime access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-white" />
                    <span>All future features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-white" />
                    <span>VIP support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-white" />
                    <span>Exclusive beta access</span>
                  </li>
                </ul>
                <Link href="/demo">
                  <Button variant="secondary" className="mt-6 w-full bg-white text-purple-600 hover:bg-slate-100">
                    Join Founders' Circle
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Ready to Transform Your Productivity?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Join thousands of users who are already achieving more with Nexus. Start your free trial today.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Link href="/demo">
              <Button size="lg" className="px-8">
                Join the Beta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}