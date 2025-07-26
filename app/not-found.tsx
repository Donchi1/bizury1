import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-orange-200 rounded-lg blur opacity-30 animate-pulse"></div>
          <div className="relative bg-white p-8 rounded-2xl shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-orange-200 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  404
                </div>
                <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                  Oops!
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
            <p className="text-gray-600 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="group">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" asChild className="group">
                <Link href="/products" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Browse Products
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-8">
          Need help?{' '}
          <Link href="/contact" className="text-blue-600 hover:underline font-medium">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
