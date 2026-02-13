import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PetType, Gender, type PetResponse } from '../types/pet';
import { Button } from './Button';
import { Input } from './Input';

const petSchema = z.object({
    name: z.string().min(1, 'Pet name is required'),
    type: z.string().min(1, 'Please select a pet type'),
    breed: z.string().min(1, 'Breed is required'),
    age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Age must be a non-negative number',
    }),
    gender: z.string().min(1, 'Please select gender'),
    weight: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Weight must be a positive number',
    }),
    bio: z.string().optional(),
});

type PetFormValues = z.infer<typeof petSchema>;

interface PetFormProps {
    initialData?: PetResponse;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    buttonText?: string;
}

export function PetForm({ initialData, onSubmit, onCancel, isLoading, buttonText }: PetFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PetFormValues>({
        resolver: zodResolver(petSchema),
        defaultValues: {
            name: initialData?.name || '',
            type: initialData?.type || 'DOG',
            breed: initialData?.breed || '',
            age: initialData?.age?.toString() || '',
            gender: initialData?.gender || 'MALE',
            weight: initialData?.weight?.toString() || '',
            bio: initialData?.bio || '',
        },
    });

    const handleFormSubmit = async (data: PetFormValues) => {
        const formattedData = {
            ...data,
            age: Number(data.age),
            weight: Number(data.weight),
        };
        await onSubmit(formattedData);
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <Input
                    label="Pet Name"
                    placeholder="Buddy"
                    error={errors.name?.message}
                    {...register('name')}
                />

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Pet Type</label>
                    <select
                        {...register('type')}
                        className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                    >
                        {Object.values(PetType).map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    {errors.type && <p className="text-xs font-medium text-red-500">{errors.type.message}</p>}
                </div>

                <Input
                    label="Breed"
                    placeholder="Golden Retriever"
                    error={errors.breed?.message}
                    {...register('breed')}
                />

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Gender</label>
                    <select
                        {...register('gender')}
                        className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                    >
                        {Object.values(Gender).map((g) => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </select>
                    {errors.gender && <p className="text-xs font-medium text-red-500">{errors.gender.message}</p>}
                </div>

                <Input
                    label="Age (in years)"
                    type="number"
                    placeholder="3"
                    error={errors.age?.message}
                    {...register('age')}
                />

                <Input
                    label="Weight (in kg)"
                    type="number"
                    step="0.1"
                    placeholder="25.5"
                    error={errors.weight?.message}
                    {...register('weight')}
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Short Bio</label>
                <textarea
                    {...register('bio')}
                    rows={4}
                    placeholder="Tell us about your pet's personality..."
                    className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all resize-none"
                />
            </div>

            <div className="pt-4 flex gap-4">
                <Button type="submit" className="flex-1" size="lg" isLoading={isLoading}>
                    {buttonText || 'Save Pet Details'}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
