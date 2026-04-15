import { z } from 'zod'

export const fieldFormSchema = z.object({
  name: z
    .string()
    .min(1, '圃場名を入力してください')
    .max(50, '圃場名は50文字以内です'),
})

export type FieldFormValues = z.infer<typeof fieldFormSchema>
