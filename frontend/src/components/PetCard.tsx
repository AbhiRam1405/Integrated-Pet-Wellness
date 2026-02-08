import { PetType, type PetResponse } from '../types/pet';
import { Button } from './Button';
import { Calendar, Dna, Info, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PetCardProps {
    pet: PetResponse;
    onDelete?: (id: string) => void;
}

const typeIcons: Record<PetType, string> = {
    [PetType.DOG]: '🐶',
    [PetType.CAT]: '🐱',
    [PetType.BIRD]: '🦜',
    [PetType.RABBIT]: '🐰',
    [PetType.OTHER]: '🐾',
};

export function PetCard({ pet, onDelete }: PetCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:shadow-slate-200 hover:-translate-y-1">
            <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-3xl shadow-inner">
                    {typeIcons[pet.type] || '🐾'}
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                        onClick={() => onDelete?.(pet.id)}
                    >
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>

            <div className="mt-4">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {pet.name}
                </h3>
                <p className="text-sm font-medium text-slate-500">{pet.breed}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <div className="flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    <Calendar size={14} className="mr-1.5" />
                    {pet.age} years
                </div>
                <div className="flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    <Dna size={14} className="mr-1.5" />
                    {pet.gender}
                </div>
            </div>

            <div className="mt-6">
                <Link to={`/pets/${pet.id}`}>
                    <Button variant="outline" className="w-full justify-between" size="sm">
                        View Details
                        <Info size={16} />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
