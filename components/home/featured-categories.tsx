import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { mockApi } from "@/lib/mock-data"
import { Category } from "@/lib/types"


export async function FeaturedCategories() {
  const categories = await mockApi.getCategories() as Category[]
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link key={category.name} href={`/category/${category.name}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="relative h-24 w-24 mx-auto mb-3">
                  <Image
                    src={category.photo || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-gray-500">{category.count}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
