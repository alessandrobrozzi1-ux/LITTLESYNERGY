import { BrandForm } from '@/components/brand-form'

export default function NewBrandPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">New Brand</h1>
        <p className="mt-1 text-sm text-gray-500">Configure a new language brand</p>
      </div>
      <BrandForm />
    </div>
  )
}
