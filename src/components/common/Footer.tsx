import { Facebook, Instagram, Twitter, Mail } from 'lucide-react'
import '../../styles/common/Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>BikeHub</h4>
          <p>The trusted marketplace for quality bikes</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>About</h4>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">About BikeHub</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Guide</a></li>
            <li><a href="#">Contact Support</a></li>
            <li><a href="#">Report Issue</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:support@bikehub.com"><Mail size={16} /> support@bikehub.com</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 BikeHub. All rights reserved.</p>
      </div>
    </footer>
  )
}
