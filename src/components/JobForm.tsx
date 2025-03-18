'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Define job status options
const statusOptions = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' }
];

// Define form field type
interface JobFormData {
  company: string;
  position: string;
  location: string;
  url: string;
  description: string;
  salary: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notes: string;
  status: string;
  applied_date: string;
}

// Define initial form data
const initialFormData: JobFormData = {
  company: '',
  position: '',
  location: '',
  url: '',
  description: '',
  salary: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  notes: '',
  status: 'saved',
  applied_date: ''
};

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  isEditing?: boolean;
}

export default function JobForm({ initialData, isEditing = false }: JobFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    ...initialFormData,
    ...initialData
  });
  const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name as keyof JobFormData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof JobFormData];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Partial<Record<keyof JobFormData, string>> = {};
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    
    if (formData.status === 'applied' && !formData.applied_date) {
      newErrors.applied_date = 'Applied date is required when status is "Applied"';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This is where you would call your API
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form data submitted:', formData);
      
      // Redirect to jobs list
      router.push('/jobs');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-6">
          {isEditing ? 'Edit Job Application' : 'Add New Job Application'}
        </h2>
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          {/* Company */}
          <div className="sm:col-span-2">
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company *
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="company"
                id="company"
                value={formData.company}
                onChange={handleChange}
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.company ? 'border-red-300' : ''
                }`}
                placeholder="Company name"
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company}</p>
              )}
            </div>
          </div>
          
          {/* Position */}
          <div className="sm:col-span-2">
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position *
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="position"
                id="position"
                value={formData.position}
                onChange={handleChange}
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.position ? 'border-red-300' : ''
                }`}
                placeholder="Job title or position"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position}</p>
              )}
            </div>
          </div>
          
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="City, State or Remote"
              />
            </div>
          </div>
          
          {/* Salary */}
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
              Salary
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="salary"
                id="salary"
                value={formData.salary}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Expected or offered salary"
              />
            </div>
          </div>
          
          {/* URL */}
          <div className="sm:col-span-2">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              Job URL
            </label>
            <div className="mt-1">
              <input
                type="url"
                name="url"
                id="url"
                value={formData.url}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="https://example.com/job-posting"
              />
            </div>
          </div>
          
          {/* Status & Date */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="mt-1">
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Applied Date */}
          <div>
            <label htmlFor="applied_date" className="block text-sm font-medium text-gray-700">
              Applied Date
              {formData.status === 'applied' && ' *'}
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="applied_date"
                id="applied_date"
                value={formData.applied_date}
                onChange={handleChange}
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.applied_date ? 'border-red-300' : ''
                }`}
              />
              {errors.applied_date && (
                <p className="mt-1 text-sm text-red-600">{errors.applied_date}</p>
              )}
            </div>
          </div>
          
          {/* Description */}
          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Job Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Brief description of the job"
              />
            </div>
          </div>
          
          {/* Contact Information Section */}
          <div className="sm:col-span-2 mt-6">
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add details about your contact person for this job application.
            </p>
          </div>
          
          {/* Contact Name */}
          <div>
            <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700">
              Contact Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="contact_name"
                id="contact_name"
                value={formData.contact_name}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Recruiter or hiring manager name"
              />
            </div>
          </div>
          
          {/* Contact Email */}
          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
              Contact Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="contact_email"
                id="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="email@example.com"
              />
            </div>
          </div>
          
          {/* Contact Phone */}
          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
              Contact Phone
            </label>
            <div className="mt-1">
              <input
                type="tel"
                name="contact_phone"
                id="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="(123) 456-7890"
              />
            </div>
          </div>
          
          {/* Notes */}
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <div className="mt-1">
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Additional notes about this job application"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Job' : 'Add Job'}
        </button>
      </div>
    </form>
  );
}