export interface Template {
  id: number
  name: string
  description: string
  file?: string
  fields: { id: number; label: string; type: string }[]
}