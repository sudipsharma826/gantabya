import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/auth";
import Image from "next/image";
import Link from "next/link";

// Features array for easy management
const features = [
  {
    icon: "🗺️",
    title: "Trip Planning",
    description: "Plan your perfect trip with detailed itineraries and destinations",
    status: "available"
  },
  {
    icon: "📅",
    title: "Trip Management",
    description: "Organize and manage all your trips in one place",
    status: "available"
  },
  {
    icon: "📸",
    title: "Photo Gallery",
    description: "Upload and organize photos from your travels",
    status: "coming-soon"
  },
  {
    icon: "💰",
    title: "Budget Tracking",
    description: "Track expenses and manage your travel budget",
    status: "coming-soon"
  },
  {
    icon: "🌍",
    title: "Travel Recommendations",
    description: "Get AI-powered recommendations for destinations and activities",
    status: "planned"
  },
  {
    icon: "👥",
    title: "Group Travel",
    description: "Plan trips with friends and family collaboratively",
    status: "planned"
  }
];

const upcomingFeatures = [
  "Real-time weather updates",
  "Flight and hotel booking integration",
  "Travel document management",
  "Offline map access",
  "Travel journal and notes",
  "Social sharing capabilities"
];

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Image 
              src="/logo.png" 
              alt="Gantabya Logo" 
              width={120} 
              height={120} 
              className="mx-auto mb-6"
            />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">Gantabya</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Your ultimate travel planning companion. Plan, organize, and manage your adventures with ease.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {session ? (
              <Link href="/trips">
                <Button size="lg" className="px-8 py-3 text-lg">
                  View My Trips 🎒
                </Button>
              </Link>
            ) : (
              <Link href="/api/auth/signin">
                <Button size="lg" className="px-8 py-3 text-lg">
                  Get Started 🚀
                </Button>
              </Link>
            )}
            <Link href="#features">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">∞</div>
              <div className="text-gray-600">Endless Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">100%</div>
              <div className="text-gray-600">Free to Use</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <div className="text-gray-600">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Every Traveler
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to plan and manage your perfect trip
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">{feature.icon}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      feature.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : feature.status === 'coming-soon'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {feature.status === 'available' ? '✅ Available' : 
                       feature.status === 'coming-soon' ? '🔄 Coming Soon' : '📋 Planned'}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upcoming Features */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-blue-800">
                🚀 More Features Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upcomingFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Gantabya Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              About Gantabya
            </h2>
            <div className="text-lg text-gray-700 leading-relaxed space-y-6">
              <p>
                <strong>Gantabya</strong> (गन्तब्य) is a Nepali word meaning "destination" - and that's exactly what we help you reach. 
                Whether you're planning a weekend getaway or a month-long adventure, Gantabya makes travel planning simple and enjoyable.
              </p>
              <p>
                Our platform combines modern technology with intuitive design to give you complete control over your travel experience. 
                From initial planning to trip management, we've got you covered every step of the way.
              </p>
              <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">🎯 Our Mission</h3>
                <p className="text-gray-600">
                  To make travel planning accessible, organized, and stress-free for everyone. 
                  We believe that great adventures start with great planning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Info Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Built with ❤️ by Developers
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="text-6xl mb-4">👨‍💻</div>
                  <CardTitle className="text-2xl">Modern Technology</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Frontend:</strong> Next.js 15, React 18, TypeScript</p>
                    <p><strong>Backend:</strong> Next.js API Routes, Prisma ORM</p>
                    <p><strong>Database:</strong> PostgreSQL</p>
                    <p><strong>Authentication:</strong> NextAuth.js</p>
                    <p><strong>Styling:</strong> Tailwind CSS</p>
                    <p><strong>File Upload:</strong> UploadThing</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="text-6xl mb-4">🌟</div>
                  <CardTitle className="text-2xl">Open Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Gantabya is built as an open-source project, continuously improving 
                      with new features and enhancements.
                    </p>
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://github.com/sudipsharma826/gantabya" target="_blank" rel="noopener noreferrer">
                          📚 View on GitHub
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="mailto:contact@gantabya.com">
                          📧 Contact Developer
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-12">
              <p className="text-gray-500 text-sm">
                Made with 💙 for travelers around the world
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Adventure?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of travelers who trust Gantabya for their trip planning needs
          </p>
          {session ? (
            <Link href="/trips/create">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                Plan Your Next Trip ✈️
              </Button>
            </Link>
          ) : (
            <Link href="/api/auth/signin">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                Sign Up Free 🎉
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}