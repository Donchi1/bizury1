"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { mockProducts } from "@/lib/mock-data"
import { Store } from "@/lib/types"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { useEffect, useMemo } from "react"

const productFormSchema = z.object({
  title: z.string().min(3, "Product name must be at least 3 characters."),
  initial_price: z.coerce.number().min(0, "Price must be a positive number."),
  sponsered: z.boolean().optional(),
  amazon_choice: z.boolean().optional(),
  store_id: z.string().optional(),
  mock_product_id: z.string().optional(),
  availability: z.string().optional(),
  max_quantity_available: z.number().optional(),
  description: z.string().optional(),
})

export type ProductFormValues = z.infer<typeof productFormSchema>


interface ProductFormProps {
  initialData?: ProductFormValues
  stores: Store[]
  selectedStore: string
  onStoreChange: (value: string) => void
  selectedProduct: string
  onProductChange: (value: string) => void
  onSubmit: (data: ProductFormValues) => void
  onCancel: () => void
  isSubmitting: boolean
  isEdit: boolean
}

export function ProductForm({
  initialData,
  stores,
  selectedStore,
  onStoreChange,
  selectedProduct,
  onProductChange,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData || {
      title: "",
      initial_price: 0,
      availability: "",
      amazon_choice: false,
      max_quantity_available: 0,
      sponsered: false,
      description: "",
    },
  })
  const productsForList = useMemo(() => {
    if (!selectedStore) return mockProducts;

    const selectedStoreProducts = stores.find(store => store.id === selectedStore)?.products || [];
    const existingProductAsins = new Set(selectedStoreProducts.map(p => p.asin));

    return mockProducts.filter(product => !existingProductAsins.has(product.asin));
  }, [selectedStore, stores]);
  const title = selectedProduct ? productsForList.find(product => product.asin === selectedProduct)?.title : ""

  useEffect(() => {
    if (isEdit) return
    form.setValue("title", title!)
  }, [title])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Store Selection */}
        {!isEdit ?
          (<><FormField
            control={form.control}
            name="store_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store</FormLabel>
                <Select
                  value={selectedStore}
                  onValueChange={(value) => {
                    onStoreChange(value)
                    field.onChange(value)
                  }}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

            <FormField
              control={form.control}
              name="mock_product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Product</FormLabel>
                  <Select
                    value={selectedProduct}
                    onValueChange={(value) => {
                      onProductChange(value)
                      field.onChange(value)
                    }}
                    disabled={isSubmitting || !selectedStore}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productsForList.map((product) => (
                        <SelectItem key={product.title} value={product.asin!}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Image src={product.image_url!} alt={product.title} width={50} height={50} />
                              <span>{formatPrice(product.initial_price!)}</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <span>{product.brand}</span>
                              <span>{product.max_quantity_available}</span>
                              <span>{product.availability}</span>
                            </div>
                          </div>
                          <span>{product.title.slice(0, 50)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a product from our catalog
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the product..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>) : (<>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the product..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Electronics" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="initial_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="99.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <Select value={field.value?.toLowerCase()} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger >
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in stock">In Stock</SelectItem>
                        <SelectItem value="out of stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="amazon_choice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amazon Choice</FormLabel>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="ml-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sponsered"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sponsered</FormLabel>
                  <FormControl >
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="ml-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_quantity_available"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Quantity Available</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 150" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the product..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>)}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 