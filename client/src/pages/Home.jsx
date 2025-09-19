import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Trophy,
  Heart,
  Sparkles,
  Globe,
  Shield,
  Award,
  Waves,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  Loader,
  Quote,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState([]);
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [features, setFeatures] = useState([]);

  // Fetch data from API (to be implemented)
  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setLoading(true);

        // Simulated data - replace with actual API calls
        setTimeout(() => {
          setQuotes([
            {
              text: "The ocean is a mighty harmonist. The best way to appreciate it is to help preserve it.",
              author: "William Wordsworth",
            },
            {
              text: "We won't have a society if we destroy the environment. Every piece of plastic removed from our beaches matters.",
              author: "Margaret Mead",
            },
            {
              text: "The greatest threat to our planet is the belief that someone else will save it. Join us today.",
              author: "Robert Swan",
            },
            {
              text: "Clean beaches don't happen by chance, they happen by change. Be that change.",
              author: "Unknown",
            },
          ]);

          setCarouselSlides([
            {
              title: "Join the Coastal Cleanup Movement",
              description:
                "Be part of the solution to protect our oceans and beaches from pollution.",
              bgImage:
                "https://images.pexels.com/photos/9034686/pexels-photo-9034686.jpeg",
              quoteIndex: 0,
            },
            {
              title: "Track Your Environmental Impact",
              description:
                "See real-time data on how your efforts contribute to cleaner coastlines.",
              bgImage:
                "https://images.pexels.com/photos/9034669/pexels-photo-9034669.jpeg",
              quoteIndex: 1,
            },
            {
              title: "Make a Lasting Impact",
              description:
                "Join thousands of volunteers making our coastlines cleaner and safer.",
              bgImage:
                "https://images.pexels.com/photos/13178207/pexels-photo-13178207.jpeg",
              quoteIndex: 2,
            },
          ]);

          // Demo events data
          setUpcomingEvents([
            {
              id: 1,
              title: "Marine Beach Cleanup Drive",
              date: "2023-10-28",
              time: "08:00 AM",
              location: "Marine Drive, Mumbai",
              participants: 42,
              image:
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
              organizer: "Mumbai Coastal Guardians",
            },
            {
              id: 2,
              title: "Juhu Beach Restoration",
              date: "2023-11-05",
              time: "07:30 AM",
              location: "Juhu Beach, Mumbai",
              participants: 35,
              image:
                "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
              organizer: "Beach Warriors Collective",
            },
            {
              id: 3,
              title: "Versova Coastal Conservation",
              date: "2023-11-12",
              time: "09:00 AM",
              location: "Versova Beach, Mumbai",
              participants: 28,
              image:
                "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
              organizer: "Ocean Preservation Society",
            },
          ]);

          // Demo testimonials data
          setTestimonials([
            {
              id: 1,
              name: "Priya Sharma",
              role: "Environmental Activist",
              image:
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
              text: "ShoreClean has revolutionized how we organize cleanup drives. The AI-powered coordination and real-time tracking have increased our volunteer participation by 300%.",
              rating: 5,
            },
            {
              id: 2,
              name: "Arjun Patel",
              role: "Volunteer Coordinator",
              image:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
              text: "The gamification features keep volunteers engaged and motivated. Our regular participants have grown from 20 to over 200 in just six months!",
              rating: 5,
            },
            {
              id: 3,
              name: "Dr. Meera Krishnan",
              role: "Marine Biologist",
              image:
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80",
              text: "The impact tracking and analytics help us measure our environmental progress scientifically. It's incredibly valuable for our research and reporting.",
              rating: 5,
            },
          ]);

          setFeatures([
            {
              icon: Users,
              title: "Role-Based Access",
              description:
                "Separate dashboards for organizers and volunteers with tailored experiences.",
              gradient: "from-blue-400 to-cyan-400",
            },
            {
              icon: Calendar,
              title: "Smart Event Management",
              description:
                "Create, edit, and track events with QR-based attendance and real-time updates.",
              gradient: "from-cyan-400 to-teal-400",
            },
            {
              icon: Sparkles,
              title: "AI-Powered Content",
              description:
                "Automated flyer generation and multilingual chatbot support for better engagement.",
              gradient: "from-teal-400 to-green-400",
            },
            {
              icon: Trophy,
              title: "Gamified Rewards",
              description:
                "Earn badges, certificates, and rewards while making a real environmental impact.",
              gradient: "from-green-400 to-emerald-400",
            },
            {
              icon: Shield,
              title: "Impact Tracking",
              description:
                "Real-time analytics dashboard with comprehensive impact measurement and reporting.",
              gradient: "from-purple-400 to-indigo-400",
            },
            {
              icon: Globe,
              title: "CSR Integration",
              description:
                "Seamless donation management with 80G tax benefits and corporate partnerships.",
              gradient: "from-indigo-400 to-blue-400",
            },
          ]);

          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (carouselSlides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [carouselSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading ShoreClean...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <Navbar />

      {/* Hero Section with Background Carousel */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden min-h-screen flex items-center">
        {/* Background Carousel */}
        <div className="absolute inset-0 z-0">
          {carouselSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                index === currentSlide
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${slide.bgImage})`,
              }}
            ></div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Protecting Our
            <br />
            <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              Coastal Heritage
            </span>
          </h1>

          {/* Quotes Section - Synchronized with Carousel */}
          <div className="max-w-3xl mx-auto mb-12 relative">
            {quotes.map((quote, index) => (
              <div
                key={index}
                className={`transition-all duration-1000 text-center ${
                  carouselSlides[currentSlide]?.quoteIndex === index
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 absolute"
                }`}
              >
                <div className="border-5 border-cyan-300/70 rounded-xl bg-black/30 p-6 shadow-lg backdrop-blur-md inline-block transition-all duration-700">
                  <Quote className="h-8 w-8 mx-auto mb-4 text-cyan-200 opacity-80" />
                  <p className="text-xl italic mb-4 text-white/95">
                    "{quote.text}"
                  </p>
                  <p className="text-cyan-200 font-medium">— {quote.author}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white/90 text-cyan-700 rounded-xl shadow-lg font-semibold flex items-center justify-center transition-all duration-300 transform hover:bg-cyan-50 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer">
              <Users className="h-5 w-5 mr-2" />
              Join as Volunteer
            </button>
            <button className="px-8 py-4 bg-cyan-600/90 text-white rounded-xl border border-cyan-500/50 font-semibold flex items-center justify-center transition-all duration-300 transform hover:bg-cyan-700 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer">
              <Calendar className="h-5 w-5 mr-2" />
              Organize Event
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg font-semibold flex items-center justify-center transition-all duration-300 transform hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Try Community Chat
            </button>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 px-6 bg-white/70">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Upcoming{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Events
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our upcoming coastal cleanup events and make a real
              difference in your community.
            </p>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-sm transition-all duration-300 overflow-hidden border border-gray-100 group transform hover:scale-105 hover:shadow-xl hover:border-cyan-300"
                >
                  <div
                    className="h-48 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${event.image})` }}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {event.time}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {event.title}
                    </h3>

                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-cyan-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">
                          {event.participants} joined
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        by {event.organizer}
                      </div>
                    </div>

                    <button className="w-full mt-4 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors duration-300 font-medium cursor-pointer">
                      Join Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/80 rounded-xl border border-gray-200/50 mb-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                No upcoming events
              </h3>
              <p className="text-gray-500">
                Check back later for new coastal cleanup events.
              </p>
            </div>
          )}

          <div className="text-center">
            <button className="inline-flex items-center px-8 py-3 bg-white border border-cyan-200 text-cyan-600 rounded-xl hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300 font-semibold">
              View More Events
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                ShoreClean?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform addresses every challenge in coastal
              cleanup coordination, from volunteer engagement to impact
              measurement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300 border border-white backdrop-blur-sm"
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-white/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              What Our{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Community Says
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from organizers and volunteers who are making a difference
              with ShoreClean.
            </p>
          </div>

          {testimonials.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white p-8 rounded-xl shadow-sm transition-all duration-300 border border-gray-100 transform hover:scale-105 hover:shadow-xl hover:border-cyan-300"
                >
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {testimonial.name}
                      </h4>
                      <p className="text-cyan-500 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-amber-400 fill-current"
                      />
                    ))}
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/90 rounded-xl border border-gray-200/50">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                No testimonials yet
              </h3>
              <p className="text-gray-500">
                Be the first to share your ShoreClean experience!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20"></div>
            <div className="relative z-10">
              <Award className="h-16 w-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-4xl font-bold mb-6">
                Ready to Make an Impact?
              </h2>
              <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
                Join our growing community of environmental champions and help
                create cleaner, healthier coastlines for future generations.
              </p>
              <button className="px-10 py-4 bg-white text-cyan-600 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-300 transform hover:bg-cyan-50 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer">
                Get Started Today
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
