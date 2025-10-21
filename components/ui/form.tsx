'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, FormProvider, useFormContext, FieldPath, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { Button } from './button'
import { AnimatedIcon } from './animated-icons'

interface FormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>
  onSubmit: (data: T) => void | Promise<void>
  defaultValues?: Partial<T>
  children: React.ReactNode
  className?: string
}

export function Form<T extends FieldValues>({
  schema,
  onSubmit,
  defaultValues,
  children,
  className
}: FormProps<T>) {
  const methods = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: defaultValues as any,
    mode: 'onChange'
  })

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={cn('space-y-6', className)}
      >
        {children}
      </form>
    </FormProvider>
  )
}

interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  label?: string
  placeholder?: string
  type?: string
  required?: boolean
  className?: string
  animate?: boolean
}

export function FormField<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  className,
  animate = true
}: FormFieldProps<T>) {
  const {
    register,
    formState: { errors },
    watch
  } = useFormContext<T>()

  const error = errors[name]?.message as string | undefined
  const value = watch(name)

  return (
    <motion.div
      className={cn('space-y-2', className)}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <motion.label
          htmlFor={name}
          className={cn(
            'block text-sm font-medium text-foreground transition-colors',
            error && 'text-destructive',
            value && 'text-primary'
          )}
          animate={animate ? {
            scale: value ? 1.02 : 1,
            color: error ? '#ef4444' : value ? '#3b82f6' : '#0f172a'
          } : undefined}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </motion.label>
      )}
      
      <div className="relative">
        <Input
          {...register(name)}
          id={name}
          type={type}
          placeholder={placeholder}
          className={cn(
            'transition-all duration-200',
            value && 'border-primary/50 bg-primary/5',
            error && 'border-destructive bg-destructive/5'
          )}
        />
        
        {value && !error && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <AnimatedIcon 
              icon="check" 
              size="sm" 
              color="present"
              variant="scale"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

interface FormSelectProps<T extends FieldValues> {
  name: FieldPath<T>
  label?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
  required?: boolean
  className?: string
  animate?: boolean
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  options,
  placeholder = 'Select an option',
  required = false,
  className,
  animate = true
}: FormSelectProps<T>) {
  const {
    register,
    formState: { errors },
    watch
  } = useFormContext<T>()

  const error = errors[name]?.message as string | undefined
  const value = watch(name)

  return (
    <motion.div
      className={cn('space-y-2', className)}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <label
          htmlFor={name}
          className={cn(
            'block text-sm font-medium text-foreground',
            error && 'text-destructive'
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <select
        {...register(name)}
        id={name}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          value && 'border-primary/50 bg-primary/5'
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface FormSubmitProps {
  children: React.ReactNode
  loading?: boolean
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export function FormSubmit({
  children,
  loading = false,
  className,
  variant = 'default'
}: FormSubmitProps) {
  const { formState } = useFormContext()
  const { isSubmitting, isValid } = formState

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={loading || !isValid || isSubmitting}
      className={cn('w-full', className)}
    >
      {loading || isSubmitting ? 'Loading...' : children}
    </Button>
  )
}

// Specialized form components for attendance system
export const LoginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const UserFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['OFFICE', 'TEACHER', 'STUDENT']),
  phone: z.string().optional(),
})

export const ScheduleFormSchema = z.object({
  subjectId: z.string().min(1, 'Please select a subject'),
  classId: z.string().min(1, 'Please select a class'),
  teacherId: z.string().min(1, 'Please select a teacher'),
  date: z.string().min(1, 'Please select a date'),
  startTime: z.string().min(1, 'Please select start time'),
  endTime: z.string().min(1, 'Please select end time'),
  location: z.string().optional(),
})

export type LoginFormData = z.infer<typeof LoginFormSchema>
export type UserFormData = z.infer<typeof UserFormSchema>
export type ScheduleFormData = z.infer<typeof ScheduleFormSchema>