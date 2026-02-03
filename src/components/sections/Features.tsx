import { Shield, TrendingUp, Users, Zap } from 'lucide-react'

const features = [
  { id: 1, icon: Shield, title: 'Safe & Secure', description: 'Verified sellers and authentic bikes' },
  { id: 2, icon: TrendingUp, title: 'Best Prices', description: 'Compare prices from thousands of listings' },
  { id: 3, icon: Users, title: 'Large Community', description: 'Connect with thousands of bike lovers' },
  { id: 4, icon: Zap, title: 'Quick Process', description: 'Fast and easy buying and selling' },
]

export default function Features() {
  return (
    <section className="bg-white py-16 border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6">
        <h2 className="text-2xl font-bold text-green-600 mb-10">Why Choose BikeHub</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ id, icon: Icon, title, description }) => (
            <div key={id} className="p-8 rounded-2xl hover:bg-green-50 transition-colors group text-center md:text-left">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4 mx-auto md:mx-0 group-hover:bg-green-600 group-hover:text-white transition-all">
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}