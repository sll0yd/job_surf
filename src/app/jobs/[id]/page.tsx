"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import StatusBadge from "@/components/StatusBadge";
import { jobsService } from "@/lib/api-service";
import { JobData, StatusOption } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [statusOptions] = useState<StatusOption[]>([
    { value: "saved", label: "Saved" },
    { value: "applied", label: "Applied" },
    { value: "interview", label: "Interview" },
    { value: "offer", label: "Offer" },
    { value: "rejected", label: "Rejected" },
  ]);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to login if not authenticated
        router.push("/signin");
      }
    };

    checkAuth();
  }, [router]);

  // Fetch job data
  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await jobsService.getJob(jobId);
        setJob(data);
      } catch (err) {
        console.error("Error loading job:", err);
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to load job details';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (!job) return;

    try {
      const updatedJob = await jobsService.updateJobStatus(job.id, newStatus);
      setJob(updatedJob);
      // Show success message (You can replace alert with a toast notification)
      alert(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to update status';
      alert(`Failed to update status: ${errorMessage}`);
    }
  };

  // Handle note submission
  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !newNote.trim()) return;

    try {
      const updatedJob = await jobsService.addNote(job.id, newNote);
      setJob(updatedJob);
      setNewNote("");
      // Show success message (You can replace alert with a toast notification)
      alert("Note added successfully");
    } catch (err) {
      console.error("Error adding note:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to add note';
      alert(`Failed to add note: ${errorMessage}`);
    }
  };

  // Format date
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Handle job deletion
  const handleDelete = async () => {
    if (!job) return;

    if (
      window.confirm("Are you sure you want to delete this job application?")
    ) {
      try {
        await jobsService.deleteJob(job.id);
        alert("Job deleted successfully");
        router.push("/jobs");
      } catch (err) {
        console.error("Error deleting job:", err);
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to delete job';
        alert(`Failed to delete job: ${errorMessage}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="py-20 text-center">
            <svg
              className="animate-spin h-10 w-10 mx-auto text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-4 text-gray-500">Loading job details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="py-20 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Job not found</h1>
            <p className="mt-4 text-gray-500">
              {error ||
                "The job you are looking for does not exist or has been removed."}
            </p>
            <Link
              href="/jobs"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to jobs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center">
            <Link
              href="/jobs"
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <svg
                className="mr-1 -ml-1 w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Back to jobs
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {job.position}
              </h1>
              <p className="mt-1 text-lg text-gray-500">{job.company}</p>
              <div className="mt-2 flex items-center">
                <span className="mr-2 text-sm text-gray-500">
                  {job.location}
                </span>
                <StatusBadge status={job.status} />
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/jobs/${job.id}/edit`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Status section */}
              <div className="sm:col-span-2">
                <h3 className="text-lg font-medium text-gray-900">Status</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        job.status === option.value
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job details section */}
              <div className="sm:col-span-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Job Details
                </h3>
                <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Applied Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(job.applied_date)}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Salary
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {job.salary || "Not specified"}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Job URL
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {job.url ? (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {job.url}
                        </a>
                      ) : (
                        "Not specified"
                      )}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Description
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                      {job.description || "No description provided"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Contact information section */}
              <div className="sm:col-span-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Contact Information
                </h3>
                <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Contact Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {job.contact_name || "Not specified"}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Contact Email
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {job.contact_email ? (
                        <a
                          href={`mailto:${job.contact_email}`}
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {job.contact_email}
                        </a>
                      ) : (
                        "Not specified"
                      )}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Contact Phone
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {job.contact_phone ? (
                        <a
                          href={`tel:${job.contact_phone}`}
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {job.contact_phone}
                        </a>
                      ) : (
                        "Not specified"
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Notes section */}
              <div className="sm:col-span-2">
                <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="whitespace-pre-line text-sm text-gray-700">
                    {job.notes || "No notes yet"}
                  </div>
                </div>

                {/* Add note form */}
                <form onSubmit={handleNoteSubmit} className="mt-4">
                  <div>
                    <label
                      htmlFor="note"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Add a note
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="note"
                        name="note"
                        rows={3}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Add details about your application process, interview experience, etc."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={!newNote.trim()}
                    >
                      Add Note
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200 text-right">
            <p className="text-xs text-gray-500">
              Created on {formatDate(job.created_at)} • Last updated on{" "}
              {formatDate(job.updated_at)}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
