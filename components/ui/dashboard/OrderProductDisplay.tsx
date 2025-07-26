import React from 'react'
import Image from 'next/image'

interface OrderProductDisplayProps {
  items: Array<{
    id: string
    product_name: string
    quantity: number
    total_price: number
    image_url: string
  }>
  display?: 'auto' | 'row' | 'compact'
  formatCurrency?: (amount: number) => string
}

const defaultFormatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

const OrderProductDisplay: React.FC<OrderProductDisplayProps> = ({ items, display = 'auto', formatCurrency = defaultFormatCurrency }) => {
  if (!items || items.length === 0) return null
  const mode = display === 'auto' ? (items.length === 1 ? 'row' : 'compact') : display

  if (mode === 'row') {
    const item = items[0]
    return (
      <div className="flex items-center space-x-4 p-3 border rounded-lg bg-muted/50">
        <Image src={item.image_url} alt={item.product_name} width={64} height={64} className="rounded" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-base truncate" title={item.product_name}>{item.product_name}</div>
          <div className="text-xs text-muted-foreground">Quantity: {item.quantity}</div>
        </div>
        <div className="text-base font-semibold">{formatCurrency(item.total_price)}</div>
      </div>
    )
  }

  // compact mode
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {items.map((item) => (
        <div key={item.id} className="min-w-[160px] max-w-[180px] flex-shrink-0 bg-muted/50 border rounded-lg p-2 flex flex-col items-center text-center">
          <Image src={item.image_url} alt={item.product_name} width={48} height={48} className="rounded mb-1" />
          <div className="font-medium text-xs truncate w-full" title={item.product_name}>{item.product_name}</div>
          <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
          <div className="text-xs font-semibold mt-1">{formatCurrency(item.total_price)}</div>
        </div>
      ))}
    </div>
  )
}

export default OrderProductDisplay