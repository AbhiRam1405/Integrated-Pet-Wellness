import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { petApi } from '../api/petApi';
import { PetType, Gender } from '../types/pet';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ArrowLeft, Dog } from 'lucide-react';
import { useState } from 'react';

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

export default function AddPet() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PetFormValues>({
        resolver: zodResolver(petSchema),
        defaultValues: {
            type: 'DOG',
            gender: 'MALE',
        },
    });

    const onSubmit = async (data: PetFormValues) => {
        try {
            setLoading(true);
            setError(null);

            const formattedData = {
                ...data,
                age: Number(data.age),
                weight: Number(data.weight),
            };

            await petApi.registerPet(formattedData as any);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register pet. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
            >
                <ArrowLeft size={18} className="mr-1.5" />
                Back to Dashboard
            </button>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 overflow-hidden ring-1 ring-slate-100">
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold">Register New Pet</h1>
                        <p className="text-indigo-100 mt-2 font-medium italic">Tell us about your furry, feathery, or scaly friend!</p>
                    </div>
                    <Dog className="absolute -bottom-4 -right-4 h-32 w-32 text-indigo-500 opacity-30 transform rotate-12" />
                </div>

                <form className="p-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

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
                        <Button type="submit" className="flex-1" size="lg" isLoading={loading}>
                            Complete Registration
                        </Button>
                        <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
