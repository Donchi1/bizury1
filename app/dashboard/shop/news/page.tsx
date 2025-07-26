'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertCircle, Megaphone } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import InnerLoading from '@/components/layout/InnerLoading'
import { StoreNewsItem } from '@/lib/types'




export default function StoreNewsPage() {
    const [news, setNews] = useState<StoreNewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { toast } = useToast()

    const fetchNews = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('store_news')
                .select(`
                    *,
                    author:profiles (
                        id,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('is_published', true) // Only fetch published news
                .order('created_at', { ascending: false })

            if (error) throw error
            setNews(data || [])
        } catch (err) {
            setError('Failed to load news. Please try again later.')
            toast({
                title: 'Error',
                description: 'Failed to load news',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNews()
    }, [])

    if (loading) {
        return (
            <div className="space-y-6 p-4">
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.push("/dashboard/shop")}
                        className="shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Store
                    </Button>
                    <h1 className="text-2xl font-bold">Store News & Updates</h1>
                </div>
                {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-48 w-full rounded-t-lg" />
                            <CardContent className="p-4">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2 mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-5/6" />
                            </CardContent>
                        </Card>
                    ))}
                </div> */}
                <InnerLoading itemLength={2} />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchNews}>Try Again</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-4">
            <div className="flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.push("/dashboard/shop")}
                    className="shrink-0"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Store
                </Button>
                <h1 className="text-2xl font-bold">Store News & Updates</h1>
            </div>

            {news.length === 0 ? (
                <Card className="min-h-[60vh] flex flex-col items-center justify-center">
                    <CardContent className="flex flex-col items-center text-center p-8">
                        <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-1">No news available</h3>
                        <p className="text-muted-foreground">
                            Check back later for the latest updates and announcements from our team.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {news.map((item) => (
                        <Card 
                            key={item.id} 
                            className="group overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col"
                        >
                            {item.image_urls?.[0] && (
                                <div className="relative h-48 bg-muted/50">
                                    <Image
                                        src={item.image_urls[0]}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <CardContent className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(item.created_at), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                    {item.author && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            {item.author.avatar_url ? (
                                                <Image
                                                    src={item.author.avatar_url}
                                                    alt={item.author.name}
                                                    width={24}
                                                    height={24}
                                                    className="h-6 w-6 rounded-full mr-2"
                                                />
                                            ) : (
                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center mr-2">
                                                    {item.author.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span>By {item.author.name}</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-semibold text-xl mb-2 line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-muted-foreground mb-4 line-clamp-4">
                                    {item.content}
                                </p>
                                {/* <div className="mt-auto pt-4 border-t">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                            // Show full news in a modal or separate page
                                            // router.push(`/dashboard/shop/news/${item.id}`)
                                        }}
                                    >
                                        Read More
                                    </Button>
                                </div> */}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
