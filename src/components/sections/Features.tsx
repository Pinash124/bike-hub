import { Shield, TrendingUp, Users, Zap } from 'lucide-react'
import '../../styles/sections/Features.css'

const features = [
  {
    id: 1,
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Verified sellers and authentic bikes',
  },
  {
    id: 2,
    icon: TrendingUp,
    title: 'Best Prices',
    description: 'Compare prices from thousands of listings',
  },
  {
    id: 3,
    icon: Users,
    title: 'Large Community',
    description: 'Connect with thousands of bike lovers',
  },
  {
    id: 4,
    icon: Zap,
    title: 'Quick Process',
    description: 'Fast and easy buying and selling',
  },
]

export default function Features() {
  return (
    <section className="features">
      <div className="features-container">
        <h2>Why Choose BikeHub</h2>
        
        <div className="features-grid">
          {features.map(({ id, icon: Icon, title, description }) => (
            <div key={id} className="feature-item">
              <div className="feature-icon">
                <Icon size={24} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
