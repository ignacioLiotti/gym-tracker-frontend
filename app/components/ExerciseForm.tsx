'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface ExerciseFormInputs {
  id?: string;
  name: string;
  description: string;
  muscleGroup: string;
}

interface ExerciseFormProps {
  action?: (data: FormData) => Promise<void>;
  defaultValues?: ExerciseFormInputs;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ action, defaultValues }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ExerciseFormInputs>({ defaultValues });

  const onSubmit: SubmitHandler<ExerciseFormInputs> = (data) => {
    const formData = new FormData();
    if (data.id) formData.append('id', data.id);
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('muscleGroup', data.muscleGroup);
    if (action) {
      action(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {defaultValues?.id && (
        <input type="hidden" value={defaultValues.id} {...register('id')} />
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="name"
          {...register('name', { required: true })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.name && <span className="text-red-500 text-sm">This field is required</span>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          {...register('description', { required: true })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.description && <span className="text-red-500 text-sm">This field is required</span>}
      </div>

      <div>
        <label htmlFor="muscleGroup" className="block text-sm font-medium text-gray-700">Muscle Group</label>
        <select
          id="muscleGroup"
          {...register('muscleGroup', { required: true })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select a muscle group</option>
          <option value="Legs">Legs</option>
          <option value="Chest">Chest</option>
          <option value="Back">Back</option>
          <option value="Arms">Arms</option>
          <option value="Shoulders">Shoulders</option>
          <option value="Abs">Abs</option>
        </select>
        {errors.muscleGroup && <span className="text-red-500 text-sm">This field is required</span>}
      </div>

      <div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default ExerciseForm;
