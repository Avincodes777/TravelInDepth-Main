import React from 'react'
import { Link } from 'react-router-dom'
import { Leaf, UtensilsCrossed, Landmark, Wallet, Bot, Users, Hotel, HeadphonesIcon, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: <UtensilsCrossed size={28} />,
    title: "Local Food Guides",
    category: "Culinary & Dining",
    description: "Discover authentic local cuisines, hidden street food gems and must-try dishes at every destination.",
    route: "/coming-soon"
  },
  {
    icon: <Landmark size={28} />,
    title: "Culture & Etiquette Tips",
    category: "Heritage & Custom",
    description: "Understand local customs, traditions and etiquette so you travel respectfully and connect deeply.",
    route: "/coming-soon"
  },
  {
    icon: <Wallet size={28} />,
    title: "Budget Planning & Estimates",
    category: "Smart Trip Budgeting",
    description: "Smart trip budgeting tools that help you travel more for less — no surprises, no overspending.",
    route: "/coming-soon"
  },
  {
    icon: <Leaf size={28} />,
    title: "Carbon Efficiency Score",
    category: "Sustainable Travel",
    description: "Every trip gets a carbon score. We help you make eco-conscious choices that protect our planet.",
    route: "/dashboard/eco"
  },
  {
    icon: <Bot size={28} />,
    title: "AI Travel Planner",
    category: "AI Itinerary Engine",
    description: "Our AI recommender suggests personalised itineraries based on your interests, budget and travel style.",
    route: "/#ai-trip-planner"
  },
  {
    icon: <Users size={28} />,
    title: "Travel Style Recommendations",
    category: "Group & Solo Curation",
    description: "Going with family, friends or as a couple? Get tailor-made suggestions that fit your group perfectly.",
    route: "/destinations"
  },
  {
    icon: <Hotel size={28} />,
    title: "Budget-Friendly Hotels",
    category: "Curated Accommodations",
    description: "Handpicked stays that balance comfort and cost — best value hotels for every type of traveller.",
    route: "/coming-soon"
  },
  {
    icon: <HeadphonesIcon size={28} />,
    title: "24/7 Travel Concierge",
    category: "Explorer Support",
    description: "Round the clock assistance from booking to landing back home — we're always just a message away.",
    route: "/coming-soon"
  }
]

function Featured() {
  return (
    <section className="bg-[#FDF6EC]">

      {/* Tricolor strip */}
      <div className="w-full h-1.5 flex mt-0">
        <div className="flex-1 bg-[#FF6B1A]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Heading */}
      <div className="text-center px-6 pt-16 pb-14">
        <p className="font-['DM_Sans'] text-[#8B1A1A] font-semibold tracking-[0.2em] text-sm uppercase mb-3">
          Why Choose Us
        </p>
        <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-[#2D1B00]">
          Features That <span className="text-[#FF6B1A] italic">Set Us Apart</span>
        </h2>
        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="w-10 h-[2px] bg-[#F5A623]" />
          <span className="w-2 h-2 rounded-full bg-[#FF6B1A]" />
          <span className="w-10 h-[2px] bg-[#F5A623]" />
        </div>
      </div>

      {/* Feature grid */}
      <div className="pb-20 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <Link
            to={feature.route}
            state={
              feature.route === "/coming-soon"
                ? {
                    featureName: feature.title,
                    category: feature.category,
                    description: feature.description,
                  }
                : undefined
            }
            key={index}
            className="group relative overflow-hidden bg-white rounded-2xl p-6 border border-[#F5A623]/25 shadow-sm transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_12px_30px_-8px_rgba(139,26,26,0.25)] hover:border-[#FF6B1A]/40 flex flex-col justify-between cursor-pointer text-decoration-none"
          >
            {/* Signature top accent bar — grows in on hover */}
            <span className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-[#FF6B1A] via-[#F5A623] to-[#8B1A1A] transition-all duration-500 ease-out group-hover:w-full" />

            <div>
              {/* Icon */}
              <div className="bg-[#FDF6EC] group-hover:bg-[#FF6B1A]/10 p-3 rounded-xl w-fit transition-colors duration-500 flex items-center justify-center">
                <span className="text-[#FF6B1A]">{feature.icon}</span>
              </div>

              {/* Title */}
              <h3 className="font-['Playfair_Display'] mt-4 text-[#8B1A1A] font-bold text-lg leading-snug group-hover:text-[#FF6B1A] transition-colors">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="font-['DM_Sans'] mt-2 text-[#2D1B00]/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Bottom Arrow Indicator */}
            <div className="mt-4 pt-3 border-t border-[#F5A623]/15 flex items-center justify-between text-xs font-bold text-[#FF6B1A]">
              <span>Learn More</span>
              <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Featured
