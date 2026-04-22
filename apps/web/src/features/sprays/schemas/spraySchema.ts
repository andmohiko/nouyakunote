import { z } from 'zod'

export const sprayFormSchema = z.object({
  sprayedAt: z.string().min(1, '散布日を入力してください'),
  pesticideName: z.string().min(1, '農薬名を入力してください'),
  registrationNumber: z.string().optional().default(''),
  targetCrop: z.string().min(1, '対象作物を入力してください'),
  targetPest: z.string().optional().default(''),
  fieldId: z.string().min(1, '圃場を選択してください'),
  dilutionRate: z.coerce
    .number({ invalid_type_error: '数値を入力してください' })
    .min(1, '希釈倍率を入力してください'),
  sprayAmount: z.coerce
    .number({ invalid_type_error: '数値を入力してください' })
    .min(0.01, '散布量を入力してください'),
  pesticideAmount: z.coerce
    .number({ invalid_type_error: '数値を入力してください' })
    .min(0.01, '農薬使用量を入力してください'),
  pesticideUnit: z.enum(['ml', 'L', 'g', 'kg']),
  note: z.string().max(500, '備考は500文字以内です').optional().default(''),
})

export type SprayFormValues = z.infer<typeof sprayFormSchema>
