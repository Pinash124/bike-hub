import { Facebook, Instagram, Twitter, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-900 border-t mt-12">
      <div className="max-w-[1400px] mx-auto p-8 grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div>
          <h4 className="text-sm font-semibold uppercase mb-2">BikeHub</h4>
          <p className="text-sm text-gray-600 mb-3">The trusted marketplace for quality bikes</p>
          <div className="flex gap-3">
            <a href="#" aria-label="Facebook" className="w-9 h-9 bg-green-50 border border-green-100 rounded flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white transition"><Facebook size={18} /></a>
            <a href="#" aria-label="Instagram" className="w-9 h-9 bg-green-50 border border-green-100 rounded flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white transition"><Instagram size={18} /></a>
            <a href="#" aria-label="Twitter" className="w-9 h-9 bg-green-50 border border-green-100 rounded flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white transition"><Twitter size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase mb-3">About</h4>
          <ul className="space-y-2 list-none p-0 m-0">
            <li><a href="#" className="text-gray-600 text-sm no-underline hover:text-green-600 transition">Home</a></li>
            <li><a href="#" className="text-gray-600 text-sm no-underline hover:text-green-600 transition">About BikeHub</a></li>
            <li><a href="#" className="text-gray-600 text-sm no-underline hover:text-green-600 transition">Terms of Service</a></li>
            <li><a href="#" className="text-gray-600 text-sm no-underline hover:text-green-600 transition">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase mb-3">Support</h4>
          <ul className="space-y-2 list-none p-0 m-0">
            <li><a href="#" className="text-gray-600 text-sm no-underline hover:text-green-600 transition">FAQ</a></li>
            <li><a href="#" className="text-gray-600 text-sm no-underline hover:text-green-600 transition">Guide</a></li>
            <li><a href="#" className="text-gray-600 text-sm no-underline hover:text-green-600 transition">Contact Support</a></li>
            <li><a href="#" className="text-gray-600 text-sm no-underline hover:text-green-600 transition">Report Issue</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase mb-3">Contact</h4>
          <ul className="space-y-2 list-none p-0 m-0">
            <li><a href="mailto:support@bikehub.com" className="text-gray-600 text-sm no-underline flex items-center gap-2 hover:text-green-600 transition"><Mail size={16} /> support@bikehub.com</a></li>
            <li><a href="#" className="text-gray-600 text-sm no-underline hover:text-green-600 transition">Careers</a></li>
            <li><a href="#" className="text-gray-600 text-sm no-underline hover:text-green-600 transition">Blog</a></li>
          </ul>
        </div>
      </div>

      <div className="bg-white border-t">
        <div className="max-w-[1400px] mx-auto p-4 text-center text-gray-500 text-sm">&copy; 2024 BikeHub. All rights reserved.</div>
      </div>
    </footer>
  )
}
