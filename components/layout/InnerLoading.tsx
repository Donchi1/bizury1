

import React from 'react'
import { Card, CardContent } from '../ui/card'

function InnerLoading({itemLength = 4}:{itemLength?:number}) {
  return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg p-6 animate-pulse">
              <div className="h-8 bg-gray-400 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-400 rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(itemLength)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
     
  )
}

export default InnerLoading