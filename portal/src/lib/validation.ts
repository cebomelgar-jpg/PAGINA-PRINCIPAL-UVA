import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .optional()
    .default("");

const optionalNumber = (min: number, max: number) =>
  z
    .number()
    .min(min, `El valor mínimo es ${min}.`)
    .max(max, `El valor máximo es ${max}.`)
    .nullable();

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresá un email válido."),
  password: z.string().min(1, "Ingresá tu contraseña."),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Ingresá tu nombre completo.")
      .max(80, "Máximo 80 caracteres."),
    phone: z
      .string()
      .trim()
      .min(6, "Ingresá un teléfono de contacto.")
      .max(30, "Máximo 30 caracteres."),
    email: z.string().trim().email("Ingresá un email válido."),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(72, "Máximo 72 caracteres.")
      .regex(/[A-Za-z]/, "Incluí al menos una letra.")
      .regex(/[0-9]/, "Incluí al menos un número."),
    confirmPassword: z.string(),
    acceptTerms: z.string().refine((value) => value === "on", {
      message: "Tenés que aceptar las condiciones.",
    }),
    isAdult: z.string().refine((value) => value === "on", {
      message: "Tenés que confirmar que sos mayor de 18 años.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresá tu nombre.").max(80),
  phone: z.string().trim().min(6, "Ingresá un teléfono.").max(30),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio.").max(80),
  slug: z
    .string()
    .trim()
    .min(2, "El slug es obligatorio.")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usá minúsculas, números y guiones."),
  category: z.enum(["flores", "rosin_hash", "vapes"]),
  description: optionalText(2000),
  thc: optionalText(20),
  cbd: optionalText(20),
  sativa_percent: optionalNumber(0, 100),
  indica_percent: optionalNumber(0, 100),
  aromas: z.array(z.string().trim().min(1).max(40)).max(12),
  flavors: z.array(z.string().trim().min(1).max(40)).max(12),
  effects: z.array(z.string().trim().min(1).max(40)).max(12),
  price: z.number().min(0, "El precio no puede ser negativo.").max(100_000_000),
  stock: z.number().int().min(0, "El stock no puede ser negativo.").max(100_000),
  presentation: optionalText(40),
  image_url: optionalText(500),
  active: z.boolean(),
  featured: z.boolean(),
  sort_order: z.number().int().min(-9999).max(9999),
});

export const checkoutSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.string().uuid("Producto inválido."),
          quantity: z.number().int().min(1).max(99),
        }),
      )
      .min(1, "El carrito está vacío."),
    paymentMethod: z.enum(["cash", "bank_transfer"]),
    fulfillmentMethod: z.enum(["pickup", "delivery"]),
    contactPhone: z.string().trim().min(6, "Ingresá un teléfono.").max(30),
    deliveryAddress: z.string().trim().max(300).optional().default(""),
    notes: z.string().trim().max(1000).optional().default(""),
    therapeuticNotes: z.string().trim().max(1000).optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillmentMethod === "delivery" && !data.deliveryAddress) {
      ctx.addIssue({
        code: "custom",
        path: ["deliveryAddress"],
        message: "Ingresá una dirección para la entrega.",
      });
    }
  });

export const orderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "preparing", "delivered", "cancelled"]),
  paymentStatus: z.enum(["pending", "paid", "cancelled"]),
});

export const orderNoteSchema = z.object({
  orderId: z.string().uuid(),
  adminNotes: z.string().trim().max(2000).optional().default(""),
});

export const stockSchema = z.object({
  productId: z.string().uuid(),
  stock: z.number().int().min(0).max(100_000),
});

export const toggleProductSchema = z.object({
  productId: z.string().uuid(),
  active: z.boolean(),
});

export const deleteProductSchema = z.object({
  productId: z.string().uuid(),
});

export function firstZodError(error: z.ZodError) {
  return error.issues[0]?.message || "Revisá los datos ingresados.";
}
